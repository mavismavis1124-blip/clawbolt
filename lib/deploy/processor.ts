import { prisma } from "@/lib/prisma";
import { ProviderKey, testProviderKey } from "@/lib/providerKeyTest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import net from "node:net";
import { randomBytes } from "node:crypto";

const execFileAsync = promisify(execFile);
const DOCKER_NETWORK = process.env.SIMPLECLAW_DOCKER_NETWORK || "simpleclaw-net";
const TENANT_ROOT =
  process.env.SIMPLECLAW_TENANT_ROOT || path.join(process.cwd(), ".simpleclaw-tenants");
const OPENCLAW_IMAGE =
  process.env.SIMPLECLAW_OPENCLAW_IMAGE || "ghcr.io/openclaw/openclaw:latest";

const MODEL_MAP: Record<string, string> = {
  gpt: process.env.SIMPLECLAW_MODEL_GPT || "openai/gpt-4.1",
  claude: process.env.SIMPLECLAW_MODEL_CLAUDE || "anthropic/claude-sonnet-4",
  gemini: process.env.SIMPLECLAW_MODEL_GEMINI || "google/gemini-2.5-pro",
};

// NOTE: do not forward host provider secrets into tenant containers.
// Tenant runtime credentials are written per-bot into openclaw.json.

interface QueueDeploymentJobInput {
  botId: string;
  deploymentId: string;
  model: string;
  channel: string;
  apiKey?: string;
}

interface QueueStopJobInput {
  botId: string;
}

interface JobPayload {
  deploymentId?: string;
  model?: string;
  channel?: string;
  apiKey?: string;
}

function parsePayload(payload?: string | null): JobPayload {
  if (!payload) return {};
  try {
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed === "object") return parsed as JobPayload;
  } catch {
    // ignore malformed payload and continue with fallback behavior
  }
  return {};
}

function toModelId(model: string): string {
  return MODEL_MAP[model] || model || MODEL_MAP.gpt;
}

function modelToProvider(model: string): ProviderKey | null {
  const normalized = (model || "").toLowerCase();
  if (!normalized) return null;

  if (normalized === "gemini" || normalized.includes("gemini") || normalized.startsWith("google/")) {
    return "gemini";
  }
  if (normalized === "gpt" || normalized.includes("gpt") || normalized.startsWith("openai/")) {
    return "gpt";
  }
  if (normalized === "claude" || normalized.includes("claude") || normalized.startsWith("anthropic/")) {
    return "claude";
  }

  return null;
}

async function runRuntimeCanary(model: string, apiKey?: string) {
  const provider = modelToProvider(model);

  if (!provider) {
    return { ok: true as const, message: "Skipped runtime canary (unknown provider)." };
  }

  if (!apiKey) {
    return { ok: false as const, error: `No API key available for ${provider} runtime canary.` };
  }

  return testProviderKey(provider, apiKey);
}

function buildProviderOverride(model: string, apiKey?: string) {
  if (!apiKey) return undefined;

  if (model === "gpt") {
    return {
      openai: {
        baseUrl: "https://api.openai.com/v1",
        apiKey,
        api: "openai-completions",
        models: [{ id: "gpt-4.1", name: "GPT-4.1" }],
      },
    };
  }

  if (model === "claude") {
    return {
      anthropic: {
        baseUrl: "https://api.anthropic.com/v1",
        apiKey,
        api: "anthropic-messages",
        models: [{ id: "claude-sonnet-4", name: "Claude Sonnet 4" }],
      },
    };
  }

  if (model === "gemini") {
    return {
      google: {
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        apiKey,
        api: "google-generative-ai",
        models: [{ id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" }],
      },
    };
  }

  return undefined;
}

function sanitizeContainerName(botId: string): string {
  const cleaned = botId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `sc-${cleaned.slice(0, 24)}`;
}

function getTenantDir(botId: string): string {
  return path.join(TENANT_ROOT, botId);
}

function redactSensitive(text: string): string {
  if (!text) return text;

  let sanitized = text;

  // -e FOO_API_KEY=...
  sanitized = sanitized.replace(
    /([A-Z0-9_]*(?:API_KEY|TOKEN)=[^\s]+)/g,
    (match) => {
      const idx = match.indexOf("=");
      return idx === -1 ? "***" : `${match.slice(0, idx + 1)}***`;
    }
  );

  // JSON-like "apiKey":"..." or "botToken":"..."
  sanitized = sanitized.replace(/("(?:apiKey|botToken|token)"\s*:\s*")([^"]+)(")/gi, '$1***$3');

  // Telegram bot token pattern in free text
  sanitized = sanitized.replace(/\b\d{8,}:[A-Za-z0-9_-]{20,}\b/g, "***");

  return sanitized;
}

async function runDocker(args: string[], allowFailure = false): Promise<string> {
  try {
    const { stdout } = await execFileAsync("docker", args, {
      env: process.env,
      maxBuffer: 4 * 1024 * 1024,
    });
    return (stdout || "").trim();
  } catch (error: any) {
    if (allowFailure) return "";
    const stderr = error?.stderr?.toString?.() || error?.message || "Unknown docker error";
    const safeArgs = redactSensitive(args.join(" "));
    const safeStderr = redactSensitive(stderr);
    throw new Error(`docker ${safeArgs} failed: ${safeStderr}`);
  }
}

async function ensureDockerReady() {
  await runDocker(["info"]);
}

async function ensureNetwork(networkName: string) {
  const existing = await runDocker([
    "network",
    "ls",
    "--filter",
    `name=^${networkName}$`,
    "--format",
    "{{.Name}}",
  ]);

  if (!existing.split("\n").includes(networkName)) {
    await runDocker(["network", "create", networkName]);
  }
}

async function getDockerAllocatedPorts(): Promise<Set<number>> {
  const output = await runDocker(["ps", "--format", "{{.Ports}}"], true);
  const ports = new Set<number>();

  if (!output) return ports;

  for (const line of output.split("\n")) {
    if (!line.trim()) continue;

    // Common forms:
    // - 0.0.0.0:19000->18789/tcp, [::]:19000->18789/tcp
    // - :::19000->18789/tcp
    // - 19000->18789/tcp
    const regex = /([0-9.\[\]:]*:)?(\d+)->/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      const hostPort = Number(match[2]);
      if (Number.isInteger(hostPort) && hostPort > 0) ports.add(hostPort);
    }
  }

  return ports;
}

async function isPortFree(port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    // Check wildcard bind, not loopback only.
    server.listen(port, "0.0.0.0");
  });
}

async function allocateRuntimePort(preferred?: number | null): Promise<number> {
  const dockerAllocated = await getDockerAllocatedPorts();

  if (
    preferred &&
    !dockerAllocated.has(preferred) &&
    (await isPortFree(preferred))
  ) {
    return preferred;
  }

  for (let port = 19000; port <= 19999; port += 1) {
    if (dockerAllocated.has(port)) continue;
    if (await isPortFree(port)) return port;
  }

  throw new Error("No free runtime port available in range 19000-19999");
}

async function clearTelegramWebhook(token: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drop_pending_updates: false }),
    });
  } catch {
    // best effort - long polling can still be attempted
  }
}

async function writeTenantConfig(params: {
  botId: string;
  botToken: string;
  model: string;
  modelId: string;
  apiKey?: string;
  gatewayToken: string;
}) {
  const dir = getTenantDir(params.botId);
  await fs.mkdir(dir, { recursive: true });

  const config: Record<string, any> = {
    gateway: {
      port: 18789,
      mode: "local",
      bind: "loopback",
      auth: { token: params.gatewayToken },
    },
    agents: {
      defaults: {
        model: {
          primary: params.modelId,
        },
      },
    },
    channels: {
      telegram: {
        enabled: true,
        botToken: params.botToken,
        dmPolicy: "open",
        allowFrom: ["*"],
        groupPolicy: "open",
        groups: {
          "*": {
            requireMention: false,
            groupPolicy: "open",
          },
        },
      },
    },
  };

  const providerOverride = buildProviderOverride(params.model, params.apiKey);
  if (providerOverride) {
    config.models = {
      mode: "merge",
      providers: providerOverride,
    };
  }

  await fs.writeFile(path.join(dir, "openclaw.json"), JSON.stringify(config, null, 2));
}

async function startTenantContainer(params: {
  botId: string;
  runtimePort: number;
  containerName: string;
}) {
  await ensureDockerReady();
  await ensureNetwork(DOCKER_NETWORK);

  await runDocker(["rm", "-f", params.containerName], true);

  const tenantDir = getTenantDir(params.botId);
  const args = [
    "run",
    "-d",
    "--name",
    params.containerName,
    "--restart",
    "unless-stopped",
    "--network",
    DOCKER_NETWORK,
    "-p",
    `${params.runtimePort}:18789`,
    "-v",
    `${tenantDir}:/home/node/.openclaw`,
  ];

  // Intentionally do not pass host provider env vars into tenant runtime.
  // Each tenant should use only credentials explicitly written to its config.

  args.push(OPENCLAW_IMAGE);

  const containerId = await runDocker(args);

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const state = await runDocker([
    "inspect",
    containerId,
    "--format",
    "{{.State.Status}}|{{.State.Running}}",
  ]);

  if (!state.includes("running|true")) {
    const logs = await runDocker(["logs", "--tail", "80", containerId], true);
    throw new Error(`Container failed to start (${state}). Logs: ${logs}`);
  }

  return containerId;
}

async function stopTenantContainer(containerName: string) {
  if (!containerName) return;
  await runDocker(["rm", "-f", containerName], true);
}

async function appendJobLog(jobId: string, line: string) {
  const current = await prisma.deploymentJob.findUnique({ where: { id: jobId } });
  if (!current) return;
  const nextLogs = `${current.logs || ""}${line.endsWith("\n") ? line : `${line}\n`}`;
  await prisma.deploymentJob.update({
    where: { id: jobId },
    data: { logs: nextLogs },
  });
}

async function appendDeploymentLog(deploymentId: string, line: string) {
  const current = await prisma.deployment.findUnique({ where: { id: deploymentId } });
  if (!current) return;
  const nextLogs = `${current.logs || ""}${line.endsWith("\n") ? line : `${line}\n`}`;
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { logs: nextLogs },
  });
}

export async function queueDeploymentJob(input: QueueDeploymentJobInput) {
  return prisma.deploymentJob.create({
    data: {
      botId: input.botId,
      type: "DEPLOY",
      status: "QUEUED",
      payload: JSON.stringify({
        deploymentId: input.deploymentId,
        model: input.model,
        channel: input.channel,
        apiKey: input.apiKey,
      }),
      logs: "Queued deployment job\n",
    },
  });
}

export async function queueStopJob(input: QueueStopJobInput) {
  return prisma.deploymentJob.create({
    data: {
      botId: input.botId,
      type: "STOP",
      status: "QUEUED",
      payload: JSON.stringify({}),
      logs: "Queued stop job\n",
    },
  });
}

async function claimNextJob() {
  const next = await prisma.deploymentJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  });

  if (!next) return null;

  const claimed = await prisma.deploymentJob.updateMany({
    where: { id: next.id, status: "QUEUED" },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      attempt: { increment: 1 },
    },
  });

  if (claimed.count === 0) return null;

  return prisma.deploymentJob.findUnique({
    where: { id: next.id },
    include: { bot: true },
  });
}

async function processDeployJob(job: any) {
  const payload = parsePayload(job.payload);
  const deploymentId = payload.deploymentId;
  const model = payload.model || job.bot.model || "gpt";
  const modelId = toModelId(model);
  const apiKey = payload.apiKey;

  const containerName = sanitizeContainerName(job.bot.id);
  let runtimePort = await allocateRuntimePort(job.bot.runtimePort);
  const gatewayToken = randomBytes(24).toString("hex");

  if (deploymentId) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "IN_PROGRESS" },
    });
  }

  await appendJobLog(job.id, `Deploying bot ${job.bot.id}`);
  await appendJobLog(job.id, `Model resolved to ${modelId}`);
  await appendJobLog(job.id, apiKey ? "Using per-bot API key" : "No API key provided for deployment payload");

  if (deploymentId) await appendDeploymentLog(deploymentId, "Starting deployment worker...\n");

  await clearTelegramWebhook(job.bot.token);
  await writeTenantConfig({
    botId: job.bot.id,
    botToken: job.bot.token,
    model,
    modelId,
    apiKey,
    gatewayToken,
  });

  let containerId = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      containerId = await startTenantContainer({
        botId: job.bot.id,
        runtimePort,
        containerName,
      });
      break;
    } catch (error: any) {
      const message = String(error?.message || error || "");
      const portConflict = message.includes("port is already allocated");
      if (!portConflict || attempt === 3) throw error;

      await appendJobLog(
        job.id,
        `Port ${runtimePort} was allocated concurrently. Retrying with a new port...`
      );
      runtimePort = await allocateRuntimePort();
    }
  }

  await appendJobLog(job.id, "Running provider runtime canary...");
  const canary = await runRuntimeCanary(model, apiKey);
  if (!canary.ok) {
    await appendJobLog(job.id, `Runtime canary failed: ${canary.error}`);
    if (deploymentId) {
      await appendDeploymentLog(deploymentId, `Runtime canary failed: ${canary.error}`);
    }

    // Avoid leaving a bad container running.
    await stopTenantContainer(containerName);
    throw new Error(`Runtime canary failed: ${canary.error}`);
  }

  await appendJobLog(job.id, `Runtime canary passed: ${canary.message}`);
  if (deploymentId) {
    await appendDeploymentLog(deploymentId, `Runtime canary passed: ${canary.message}`);
  }

  await prisma.bot.update({
    where: { id: job.bot.id },
    data: {
      status: "LIVE",
      runtimeStatus: "LIVE",
      containerName,
      containerId,
      runtimePort,
      webhookSecret: gatewayToken,
      lastHeartbeatAt: new Date(),
      model,
      channel: payload.channel || job.bot.channel || "telegram",
      webhookUrl: null,
    },
  });

  if (deploymentId) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "SUCCESS",
        logs:
          "Container runtime started successfully\n" +
          `Container: ${containerName}\n` +
          `Port: ${runtimePort}\n` +
          `Model: ${modelId}\n` +
          "Telegram mode: long-polling\n",
      },
    });
  }

  await prisma.deploymentJob.update({
    where: { id: job.id },
    data: {
      status: "SUCCESS",
      finishedAt: new Date(),
      logs:
        `${job.logs || ""}` +
        `Container started: ${containerName} (${containerId.slice(0, 12)})\n` +
        "Deployment completed\n",
    },
  });
}

async function processStopJob(job: any) {
  await appendJobLog(job.id, `Stopping runtime for ${job.bot.id}`);

  if (job.bot.containerName) {
    await stopTenantContainer(job.bot.containerName);
  }

  await prisma.bot.update({
    where: { id: job.bot.id },
    data: {
      status: "STOPPED",
      runtimeStatus: "STOPPED",
      containerName: null,
      containerId: null,
      runtimePort: null,
      webhookSecret: null,
      webhookUrl: null,
    },
  });

  await prisma.deploymentJob.update({
    where: { id: job.id },
    data: {
      status: "SUCCESS",
      finishedAt: new Date(),
      logs: `${job.logs || ""}Runtime stopped\n`,
    },
  });
}

async function failJob(jobId: string, botId: string, deploymentId: string | undefined, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  await prisma.deploymentJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      finishedAt: new Date(),
      error: message,
      logs: {
        set: `FAILED: ${message}\n`,
      },
    },
  });

  await prisma.bot.update({
    where: { id: botId },
    data: {
      status: "ERROR",
      runtimeStatus: "ERROR",
    },
  });

  if (deploymentId) {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "FAILED",
        error: message,
      },
    });
  }
}

async function processClaimedJob(job: any) {
  const payload = parsePayload(job.payload);
  const deploymentId = payload.deploymentId;

  try {
    if (job.type === "STOP") {
      await processStopJob(job);
      return;
    }

    await processDeployJob(job);
  } catch (error) {
    await failJob(job.id, job.botId, deploymentId, error);
    throw error;
  }
}

export async function processDeploymentQueue(maxJobs = 1) {
  const processedIds: string[] = [];

  for (let i = 0; i < maxJobs; i += 1) {
    const job = await claimNextJob();
    if (!job) break;

    processedIds.push(job.id);

    try {
      await processClaimedJob(job);
    } catch (error) {
      console.error("Deployment job failed", { jobId: job.id, error });
    }
  }

  return processedIds;
}

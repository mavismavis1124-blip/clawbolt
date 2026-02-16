import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import os from 'node:os'

const execFileAsync = promisify(execFile)

function redactSensitive(text: string) {
  if (!text) return text

  let sanitized = text

  // Key=value style
  sanitized = sanitized.replace(
    /([A-Z0-9_]*(?:API_KEY|TOKEN)=[^\s]+)/g,
    (match) => {
      const idx = match.indexOf('=')
      return idx === -1 ? '***' : `${match.slice(0, idx + 1)}***`
    }
  )

  // JSON-ish token/apiKey fields
  sanitized = sanitized.replace(/("(?:apiKey|botToken|token)"\s*:\s*")([^"]+)(")/gi, '$1***$3')

  // Telegram token pattern
  sanitized = sanitized.replace(/\b\d{8,}:[A-Za-z0-9_-]{20,}\b/g, '***')

  return sanitized
}

async function runDocker(args: string[], allowFailure = false): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync('docker', args, {
      env: process.env,
      maxBuffer: 8 * 1024 * 1024,
    })

    const merged = `${stdout || ''}${stderr || ''}`
    return merged.trim()
  } catch (error: any) {
    if (allowFailure) return ''

    const stderr = error?.stderr?.toString?.() || error?.message || 'Unknown docker error'
    throw new Error(`docker ${redactSensitive(args.join(' '))} failed: ${redactSensitive(stderr)}`)
  }
}

// GET /api/runtime/logs?botId=...&tail=120
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const botId = searchParams.get('botId')
    const tailRaw = Number(searchParams.get('tail') || 120)
    const tail = Number.isFinite(tailRaw) ? Math.min(Math.max(Math.floor(tailRaw), 20), 500) : 120

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId },
      select: {
        id: true,
        status: true,
        runtimeStatus: true,
        runtimePort: true,
        containerName: true,
        containerId: true,
        updatedAt: true,
      },
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    let containerStatus: string | null = null
    let startedAt: string | null = null
    let logs = ''
    let dockerLogs = ''
    let openclawLogs = ''
    let openclawLogPath: string | null = null

    if (bot.containerName) {
      const inspect = await runDocker(
        ['inspect', bot.containerName, '--format', '{{.State.Status}}|{{.State.StartedAt}}'],
        true
      )

      if (inspect) {
        const [status, started] = inspect.split('|')
        containerStatus = status || null
        startedAt = started || null
      } else {
        containerStatus = 'not-found'
      }

      dockerLogs = await runDocker(['logs', '--tail', String(tail), bot.containerName], true)
      dockerLogs = redactSensitive(dockerLogs)

      const openclawRaw = await runDocker(
        [
          'exec',
          bot.containerName,
          'sh',
          '-lc',
          `LOG="$(ls -1t /tmp/openclaw/openclaw-*.log 2>/dev/null | head -n 1)"; if [ -n "$LOG" ]; then echo "__OPENCLAW_LOG__:$LOG"; tail -n ${tail} "$LOG"; fi`,
        ],
        true
      )

      if (openclawRaw) {
        const lines = openclawRaw.split('\n')
        if (lines[0]?.startsWith('__OPENCLAW_LOG__:')) {
          openclawLogPath = lines[0].replace('__OPENCLAW_LOG__:', '').trim() || null
          openclawLogs = lines.slice(1).join('\n')
        } else {
          openclawLogs = openclawRaw
        }
      }

      openclawLogs = redactSensitive(openclawLogs)

      const blocks: string[] = []
      if (dockerLogs.trim()) blocks.push(`[Docker logs]\n${dockerLogs.trim()}`)
      if (openclawLogs.trim()) {
        blocks.push(
          `[OpenClaw file logs${openclawLogPath ? `: ${openclawLogPath}` : ''}]\n${openclawLogs.trim()}`
        )
      }
      logs = blocks.join('\n\n')
    }

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = Math.max(totalMem - freeMem, 0)

    return NextResponse.json({
      botId: bot.id,
      botStatus: bot.status,
      runtimeStatus: bot.runtimeStatus,
      runtimePort: bot.runtimePort,
      containerName: bot.containerName,
      containerId: bot.containerId,
      containerStatus,
      startedAt,
      updatedAt: bot.updatedAt,
      logs,
      dockerLogs,
      openclawLogs,
      openclawLogPath,
      host: {
        load1: Number(os.loadavg()[0]?.toFixed(2) || 0),
        memoryUsedPercent: Number(((usedMem / totalMem) * 100).toFixed(1)),
        memoryFreeGb: Number((freeMem / (1024 ** 3)).toFixed(2)),
      },
    })
  } catch (error) {
    console.error('Error fetching runtime logs:', error)
    return NextResponse.json({ error: 'Failed to fetch runtime logs' }, { status: 500 })
  }
}

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processDeploymentQueue, queueDeploymentJob, queueStopJob } from '@/lib/deploy/processor'
import { ProviderKey, testProviderKey } from '@/lib/providerKeyTest'

function modelToProvider(model?: string): ProviderKey | null {
  if (!model) return null
  if (model === 'gemini') return 'gemini'
  if (model === 'gpt') return 'gpt'
  if (model === 'claude') return 'claude'
  return null
}

// POST /api/deploy - Queue deployment job for a bot runtime container
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { botId, model, channel, apiKey } = body

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId },
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const resolvedModel = model || bot.model || 'gpt'
    const resolvedChannel = channel || bot.channel || 'telegram'
    const resolvedProvider = modelToProvider(resolvedModel)
    const resolvedApiKey =
      typeof apiKey === 'string' && apiKey.trim()
        ? apiKey.trim()
        : bot.apiKey || undefined

    if (resolvedProvider) {
      if (!resolvedApiKey) {
        return NextResponse.json(
          { error: `${resolvedProvider.toUpperCase()} model requires an API key. Add one in Edit Configuration first.` },
          { status: 400 }
        )
      }

      const check = await testProviderKey(resolvedProvider, resolvedApiKey)
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 })
      }
    }

    const deployment = await prisma.deployment.create({
      data: {
        botId,
        status: 'PENDING',
        logs: 'Queued deployment for container runtime...\n',
      },
    })

    await prisma.bot.update({
      where: { id: botId },
      data: {
        status: 'DEPLOYING',
        runtimeStatus: 'QUEUED',
        model: resolvedModel,
        channel: resolvedChannel,
      },
    })

    const job = await queueDeploymentJob({
      botId,
      deploymentId: deployment.id,
      model: resolvedModel,
      channel: resolvedChannel,
      apiKey: resolvedApiKey,
    })

    // Best-effort immediate processing. For production, run a dedicated worker process.
    processDeploymentQueue(1).catch((error) => {
      console.error('Background deployment processing failed:', error)
    })

    return NextResponse.json({
      success: true,
      queued: true,
      deployment: {
        id: deployment.id,
        status: deployment.status,
      },
      job: {
        id: job.id,
        status: job.status,
      },
    })
  } catch (error) {
    console.error('Error queueing deployment:', error)
    return NextResponse.json({ error: 'Failed to queue deployment' }, { status: 500 })
  }
}

// GET /api/deploy?botId=... - Latest deployment + queued/running jobs for a bot
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const botId = searchParams.get('botId')

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    return NextResponse.json({
      bot: {
        id: bot.id,
        status: bot.status,
        runtimeStatus: bot.runtimeStatus,
        containerName: bot.containerName,
        runtimePort: bot.runtimePort,
        lastHeartbeatAt: bot.lastHeartbeatAt,
      },
      deployments: bot.deployments,
      jobs: bot.jobs,
    })
  } catch (error) {
    console.error('Error reading deployment status:', error)
    return NextResponse.json({ error: 'Failed to read deployment status' }, { status: 500 })
  }
}

// DELETE /api/deploy?botId=... - Queue runtime stop job
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const botId = searchParams.get('botId')

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const bot = await prisma.bot.findFirst({
      where: { id: botId, userId },
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    await prisma.bot.update({
      where: { id: botId },
      data: {
        status: 'DEPLOYING',
        runtimeStatus: 'STOPPING',
      },
    })

    const job = await queueStopJob({ botId })

    processDeploymentQueue(1).catch((error) => {
      console.error('Background stop processing failed:', error)
    })

    return NextResponse.json({
      success: true,
      queued: true,
      job: {
        id: job.id,
        status: job.status,
      },
    })
  } catch (error) {
    console.error('Error queueing stop:', error)
    return NextResponse.json({ error: 'Failed to queue stop' }, { status: 500 })
  }
}

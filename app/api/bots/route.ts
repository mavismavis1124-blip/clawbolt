import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProviderKey, testProviderKey } from '@/lib/providerKeyTest'
import { processDeploymentQueue, queueStopJob } from '@/lib/deploy/processor'

type BotLike = {
  token: string
  apiKey?: string | null
  [key: string]: any
}

function maskToken(token: string) {
  return token.length > 20 ? `${token.slice(0, 20)}...` : '••••••••'
}

function maskApiKey(apiKey?: string | null) {
  if (!apiKey) return null
  return `••••••••${apiKey.length > 8 ? apiKey.slice(-4) : ''}`
}

function toSafeBot<T extends BotLike>(bot: T) {
  return {
    ...bot,
    token: maskToken(bot.token),
    apiKey: maskApiKey(bot.apiKey),
  }
}

function modelToProvider(model?: string): ProviderKey | null {
  if (!model) return null
  if (model === 'gemini') return 'gemini'
  if (model === 'gpt') return 'gpt'
  if (model === 'claude') return 'claude'
  return null
}

// GET /api/bots - List all bots for the current user
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bots = await prisma.bot.findMany({
      where: { userId },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const botIds = bots.map((bot) => bot.id)

    const groupedStatuses = botIds.length
      ? await prisma.deployment.groupBy({
          by: ['botId', 'status'],
          where: { botId: { in: botIds } },
          _count: { _all: true },
        })
      : []

    const deploymentStatsByBot: Record<
      string,
      { total: number; success: number; failed: number; inProgress: number; pending: number }
    > = {}

    for (const botId of botIds) {
      deploymentStatsByBot[botId] = {
        total: 0,
        success: 0,
        failed: 0,
        inProgress: 0,
        pending: 0,
      }
    }

    for (const row of groupedStatuses) {
      const stats = deploymentStatsByBot[row.botId]
      if (!stats) continue

      const count = row._count?._all || 0
      stats.total += count

      if (row.status === 'SUCCESS') stats.success += count
      else if (row.status === 'FAILED') stats.failed += count
      else if (row.status === 'IN_PROGRESS') stats.inProgress += count
      else if (row.status === 'PENDING') stats.pending += count
    }

    const safeBots = bots.map((bot) => ({
      ...toSafeBot(bot),
      deploymentStats: deploymentStatsByBot[bot.id] || {
        total: 0,
        success: 0,
        failed: 0,
        inProgress: 0,
        pending: 0,
      },
    }))

    return NextResponse.json({ bots: safeBots })
  } catch (error) {
    console.error('Error fetching bots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bots' },
      { status: 500 }
    )
  }
}

// POST /api/bots - Create a new bot
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { token, name, username, model, channel, apiKey } = body

    if (!token || !token.includes(':')) {
      return NextResponse.json(
        { error: 'Invalid bot token format' },
        { status: 400 }
      )
    }

    // Optional provider key validation on create
    const provider = modelToProvider(model || 'gpt')
    if (typeof apiKey === 'string' && apiKey.trim() && provider) {
      const check = await testProviderKey(provider, apiKey)
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 })
      }
    }

    // Validate token with Telegram
    const validateRes = await fetch(
      `https://api.telegram.org/bot${token}/getMe`
    )
    const validateData = await validateRes.json()

    if (!validateData.ok) {
      return NextResponse.json(
        { error: 'Invalid Telegram bot token' },
        { status: 400 }
      )
    }

    const botInfo = validateData.result

    // Check if bot already exists
    const existing = await prisma.bot.findFirst({
      where: { token },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bot already exists' },
        { status: 409 }
      )
    }

    const bot = await prisma.bot.create({
      data: {
        userId,
        name: name || botInfo.first_name,
        username: username || botInfo.username,
        token,
        status: 'PENDING',
        runtimeStatus: 'PENDING',
        model: model || 'gpt',
        channel: channel || 'telegram',
        apiKey: typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : null,
      },
    })

    return NextResponse.json({ bot: toSafeBot(bot) }, { status: 201 })
  } catch (error) {
    console.error('Error creating bot:', error)
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    )
  }
}

// PATCH /api/bots - Update a bot (used for status and config updates)
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, webhookUrl, runtimeStatus, model, channel, apiKey } = body

    const existing = await prisma.bot.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const targetModel = model || existing.model
    const targetProvider = modelToProvider(targetModel)
    const updateData: any = {}

    if (status) updateData.status = status
    if (runtimeStatus) updateData.runtimeStatus = runtimeStatus
    if (model) updateData.model = model
    if (channel) updateData.channel = channel
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl

    if (apiKey !== undefined) {
      const normalizedApiKey = typeof apiKey === 'string' ? apiKey.trim() : ''

      if (normalizedApiKey && targetProvider) {
        const check = await testProviderKey(targetProvider, normalizedApiKey)
        if (!check.ok) {
          return NextResponse.json({ error: check.error }, { status: 400 })
        }
      }

      updateData.apiKey = normalizedApiKey || null
    }

    const bot = await prisma.bot.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ bot: toSafeBot(bot) })
  } catch (error) {
    console.error('Error updating bot:', error)
    return NextResponse.json(
      { error: 'Failed to update bot' },
      { status: 500 }
    )
  }
}

// DELETE /api/bots - Delete a bot
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bot ID required' },
        { status: 400 }
      )
    }

    const existing = await prisma.bot.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // Stop runtime container first (best effort) to avoid orphaned Docker containers
    if (existing.containerName) {
      try {
        await queueStopJob({ botId: id })
        await processDeploymentQueue(1)
      } catch (e) {
        console.error('Failed to stop runtime before deleting bot:', e)
      }
    }

    // Delete webhook from Telegram
    try {
      await fetch(
        `https://api.telegram.org/bot${existing.token}/deleteWebhook`
      )
    } catch (e) {
      console.error('Failed to delete Telegram webhook:', e)
    }

    await prisma.bot.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bot:', error)
    return NextResponse.json(
      { error: 'Failed to delete bot' },
      { status: 500 }
    )
  }
}

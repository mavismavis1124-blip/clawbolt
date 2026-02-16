import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/webhook/telegram/[botId] - Handle Telegram webhook
export async function POST(
  req: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const { botId } = params

    // Find the bot
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const update = await req.json()

    // Log the update
    console.log(`[Bot ${botId}] Received update:`, JSON.stringify(update, null, 2))

    // Handle different update types
    if (update.message) {
      await handleMessage(bot.token, update.message)
    } else if (update.callback_query) {
      await handleCallbackQuery(bot.token, update.callback_query)
    } else if (update.inline_query) {
      await handleInlineQuery(bot.token, update.inline_query)
    }

    // Return 200 OK to Telegram
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true })
  }
}

async function handleMessage(token: string, message: any) {
  const chatId = message.chat.id
  const text = message.text || ''
  const chatType = message.chat.type

  // Skip processing if it's a channel post without user
  if (!message.from && chatType === 'channel') {
    return
  }

  // Handle commands
  if (text.startsWith('/')) {
    const command = text.split(' ')[0].toLowerCase()

    switch (command) {
      case '/start':
        await sendMessage(token, chatId,
          '👋 Hello! I\'m your SimpleClaw bot.\n\n' +
          'I\'m ready to help you! Use /help to see what I can do.'
        )
        break

      case '/help':
        await sendMessage(token, chatId,
          '🤖 *Available Commands:*\n\n' +
          '/start - Start the bot\n' +
          '/help - Show this help message\n' +
          '/status - Check bot status\n' +
          '/echo <text> - Echo your message\n\n' +
          'I\'m powered by SimpleClaw! 🚀'
        , 'Markdown')
        break

      case '/status':
        await sendMessage(token, chatId,
          '✅ Bot is live and running!\n' +
          `🕐 Current time: ${new Date().toISOString()}`
        )
        break

      case '/echo':
        const echoText = text.slice(5).trim()
        if (echoText) {
          await sendMessage(token, chatId, `📢 ${echoText}`)
        } else {
          await sendMessage(token, chatId, 'Usage: /echo <your message>')
        }
        break

      default:
        await sendMessage(token, chatId,
          `❓ Unknown command: ${command}\nUse /help to see available commands.`
        )
    }
  } else if (text) {
    // Echo non-command text with a friendly message
    await sendMessage(token, chatId,
      `📨 You said: "${text}"\n\n` +
      'I\'m a SimpleClaw bot. Try /help for commands!'
    )
  }
}

async function handleCallbackQuery(token: string, callbackQuery: any) {
  const chatId = callbackQuery.message?.chat?.id
  const data = callbackQuery.data

  if (chatId) {
    await sendMessage(token, chatId, `You clicked: ${data}`)
  }

  // Answer the callback query
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
    }),
  })
}

async function handleInlineQuery(token: string, inlineQuery: any) {
  const queryId = inlineQuery.id
  const query = inlineQuery.query || ''

  // Simple inline query response
  const results = [
    {
      type: 'article',
      id: '1',
      title: 'SimpleClaw Echo',
      description: `Echo: ${query || 'Type something...'}`,
      input_message_content: {
        message_text: query || '🤖 SimpleClaw Bot',
      },
    },
    {
      type: 'article',
      id: '2',
      title: 'Current Time',
      description: 'Get current server time',
      input_message_content: {
        message_text: `🕐 Current time: ${new Date().toISOString()}`,
      },
    },
  ]

  await fetch(`https://api.telegram.org/bot${token}/answerInlineQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inline_query_id: queryId,
      results,
    }),
  })
}

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
) {
  const payload: any = {
    chat_id: chatId,
    text,
  }

  if (parseMode) {
    payload.parse_mode = parseMode
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      console.error('Failed to send message:', await res.text())
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

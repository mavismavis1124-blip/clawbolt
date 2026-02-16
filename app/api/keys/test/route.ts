import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { ProviderKey, testProviderKey } from '@/lib/providerKeyTest'

function normalizeProvider(value: string): ProviderKey | null {
  if (value === 'gemini') return 'gemini'
  if (value === 'gpt') return 'gpt'
  if (value === 'claude') return 'claude'
  return null
}

// POST /api/keys/test
// Body: { provider: 'gemini'|'gpt'|'claude', apiKey: string }
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const providerRaw = typeof body?.provider === 'string' ? body.provider.trim() : ''
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''

    const provider = normalizeProvider(providerRaw)

    if (!provider) {
      return NextResponse.json(
        { error: 'Invalid provider. Use gemini, gpt, or claude.' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required.' }, { status: 400 })
    }

    const result = await testProviderKey(provider, apiKey)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: result.message })
  } catch (error) {
    console.error('Error testing API key:', error)
    return NextResponse.json({ error: 'Failed to test API key.' }, { status: 500 })
  }
}

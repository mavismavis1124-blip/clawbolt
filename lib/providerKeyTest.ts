export type ProviderKey = 'gemini' | 'gpt' | 'claude'

export type ProviderKeyTestResult =
  | { ok: true; message: string }
  | { ok: false; error: string; status?: number }

function timeoutSignal(timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

async function extractErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json()
    return (
      data?.error?.message ||
      data?.message ||
      data?.error ||
      fallback
    )
  } catch {
    return fallback
  }
}

export async function testProviderKey(
  provider: ProviderKey,
  apiKey: string
): Promise<ProviderKeyTestResult> {
  const key = apiKey.trim()
  if (!key) return { ok: false, error: 'API key cannot be empty.' }

  const { signal, clear } = timeoutSignal(12000)

  try {
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Reply with: OK' }] }],
            generationConfig: { maxOutputTokens: 8 },
          }),
          signal,
        }
      )

      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Gemini key validation failed.')
        return { ok: false, error: `Gemini key rejected: ${msg}`, status: res.status }
      }

      return { ok: true, message: 'Gemini key is valid.' }
    }

    if (provider === 'gpt') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        signal,
      })

      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'OpenAI key validation failed.')
        return { ok: false, error: `OpenAI key rejected: ${msg}`, status: res.status }
      }

      return { ok: true, message: 'OpenAI key is valid.' }
    }

    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      signal,
    })

    if (!res.ok) {
      const msg = await extractErrorMessage(res, 'Anthropic key validation failed.')
      return { ok: false, error: `Anthropic key rejected: ${msg}`, status: res.status }
    }

    return { ok: true, message: 'Anthropic key is valid.' }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return { ok: false, error: 'Key test timed out. Please try again.' }
    }
    return { ok: false, error: 'Unable to validate API key right now (network/runtime error).' }
  } finally {
    clear()
  }
}

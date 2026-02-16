import { NextRequest, NextResponse } from 'next/server'
import { processDeploymentQueue } from '@/lib/deploy/processor'

function isAuthorized(req: NextRequest) {
  const expected = process.env.SIMPLECLAW_WORKER_TOKEN
  if (!expected) return true

  const provided =
    req.headers.get('x-worker-token') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''

  return provided === expected
}

// POST /api/deploy/process - Process queued deployment jobs (worker tick endpoint)
export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized worker tick' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const limit = Math.max(1, Math.min(Number(body?.limit || 1), 20))

    const processedJobIds = await processDeploymentQueue(limit)

    return NextResponse.json({
      success: true,
      processed: processedJobIds.length,
      jobIds: processedJobIds,
    })
  } catch (error) {
    console.error('Failed to process deployment queue:', error)
    return NextResponse.json({ error: 'Queue processing failed' }, { status: 500 })
  }
}

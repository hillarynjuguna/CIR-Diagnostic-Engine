import { NextResponse } from 'next/server'
import { loadWeights } from '@/lib/providers/store'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const weights = await loadWeights()
    if (!weights) {
      return NextResponse.json({ status: 'No persistent weights stored. Using in-memory defaults.' })
    }

    // Return weights with computed health indicators
    const enriched = Object.entries(weights).map(([name, data]) => ({
      provider: name,
      ...data,
      health: data.consecutiveFailures >= 3 ? 'degraded' :
              data.consecutiveFailures >= 1 ? 'recovering' : 'healthy',
    }))

    return NextResponse.json({ providers: enriched, count: enriched.length })
  } catch {
    return NextResponse.json({ error: 'Weight store unavailable' }, { status: 500 })
  }
}

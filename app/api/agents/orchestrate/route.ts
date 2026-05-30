import { NextRequest, NextResponse } from 'next/server'
import { runOrchestrator } from '@/lib/agents/orchestrator'
import type { OrchestrationRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: OrchestrationRequest = await req.json()
    if (!body.query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }
    const result = await runOrchestrator(body)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Orchestration error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

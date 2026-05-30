import { NextRequest } from 'next/server'
import { runLegalResearch } from '@/lib/agents/legalResearch'
import { draftEmailReply } from '@/lib/agents/emailDrafting'
import { openai } from '@/lib/openai'
import { getAgentSettings, logAudit } from '@/lib/supabase'
import { AGENT_LANGUAGES } from '@/lib/types'
import type { OrchestrationRequest } from '@/lib/types'

const BASE_PROMPT = `You are the Supreme Orchestrator of the Lex Sovereign AI Brain — a legal research and drafting assistant.
You coordinate the Legal Research Agent and Email Drafting Agent.

Synthesise agent outputs into a clear, useful response. Structure as:
- Summary of findings
- Key relevant points (cite sources from knowledge base)
- Recommended next steps
- Risk warnings if applicable

Never fabricate law, statutes, or legal citations. Remind the user this is a research and drafting tool, not legal advice.`

function buildPrompt(language: string): string {
  if (language === 'en') return BASE_PROMPT
  const langName = AGENT_LANGUAGES[language] ?? language
  return `${BASE_PROMPT}\n\nCRITICAL: Respond entirely in ${langName}. Do not switch to English.`
}

export async function POST(req: NextRequest) {
  let body: OrchestrationRequest
  try { body = await req.json() } catch {
    return new Response('data: {"type":"error","message":"Invalid JSON"}\n\n', {
      status: 400, headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  if (!body.query?.trim()) {
    return new Response('data: {"type":"error","message":"query is required"}\n\n', {
      status: 400, headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const transform = new TransformStream()
  const writer = transform.writable.getWriter()
  const encoder = new TextEncoder()

  const send = async (data: object) => {
    try { await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch {}
  }

  ;(async () => {
    try {
      const settings = await getAgentSettings('orchestrator')
      const systemPrompt = buildPrompt(settings.language)

      await send({ type: 'status', agent: 'orchestrator', message: 'Supreme Orchestrator activated' })

      const lower = body.query.toLowerCase()
      const wantsResearch = !body.email_id ||
        /research|statute|law|right|define|find|what|how|mean|explain/.test(lower)
      const wantsDraft = !!body.email_id

      const agentsUsed = ['Supreme Orchestrator']
      let researchResult: Awaited<ReturnType<typeof runLegalResearch>> | null = null
      let draftResult:    Awaited<ReturnType<typeof draftEmailReply>>   | null = null

      if (wantsResearch) {
        await send({ type: 'status', agent: 'legal_research', message: 'Searching knowledge base and shared memory…' })
        try {
          researchResult = await runLegalResearch(body.query)
          agentsUsed.push('Legal Research Agent')
          await send({
            type: 'research_done',
            sources: researchResult.sources.length,
            memory_matches: researchResult.memoryMatches,
            unsupported_flags: researchResult.unsupportedFlags.length,
          })
        } catch (err) {
          await send({ type: 'agent_error', agent: 'legal_research', message: (err as Error).message })
        }
      }

      if (wantsDraft && body.email_id) {
        await send({ type: 'status', agent: 'email_drafting', message: 'Analysing email and drafting reply…' })
        try {
          draftResult = await draftEmailReply(body.email_id)
          agentsUsed.push('Email Drafting Agent')
          await send({
            type: 'draft_done',
            approval_id: draftResult.approval.id,
            risk_score: draftResult.draft.risk_score,
            urgency: draftResult.approval.urgency,
          })
        } catch (err) {
          await send({ type: 'agent_error', agent: 'email_drafting', message: (err as Error).message })
        }
      }

      // Build synthesis context
      const contextParts: string[] = []
      if (researchResult) {
        contextParts.push(`Research findings:\n${researchResult.answer}`)
        if (researchResult.unsupportedFlags.length > 0) {
          contextParts.push(`Risk flags:\n${researchResult.unsupportedFlags
            .map(f => `- [${f.severity.toUpperCase()}] ${f.reason}`).join('\n')}`)
        }
      }
      if (draftResult) {
        contextParts.push(
          `Email draft created — risk score ${draftResult.draft.risk_score}/100. Approval ID: ${draftResult.approval.id}`
        )
      }

      await send({ type: 'status', agent: 'orchestrator', message: 'Synthesising final response…' })

      // Stream orchestrator response token by token
      const messages: any[] = [{ role: 'system', content: systemPrompt }]
      if (contextParts.length > 0) {
        messages.push({ role: 'user', content: contextParts.join('\n\n') })
        messages.push({ role: 'assistant', content: 'Agent outputs reviewed. Preparing response.' })
      }
      messages.push({ role: 'user', content: body.query })

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        stream: true,
        temperature: 0.2,
        max_tokens: 4096,
      })

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? ''
        if (token) await send({ type: 'token', content: token })
      }

      const allFlags = [
        ...(researchResult?.unsupportedFlags ?? []),
        ...(draftResult?.draft.risk_flags ?? []),
      ]

      await logAudit({
        agentName: 'Supreme Orchestrator',
        action: 'stream_orchestration_completed',
        details: { agents_used: agentsUsed, requires_approval: !!draftResult, risk_flags: allFlags.length },
      })

      await send({
        type: 'done',
        agents_used: agentsUsed,
        risk_flags: allFlags,
        requires_approval: !!draftResult,
        approval_id: draftResult?.approval.id ?? null,
      })
    } catch (err) {
      await send({ type: 'error', message: (err as Error).message })
    } finally {
      await writer.close()
    }
  })()

  return new Response(transform.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

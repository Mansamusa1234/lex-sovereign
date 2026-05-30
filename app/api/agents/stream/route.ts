import { NextRequest } from 'next/server'
import { runLegalResearch } from '@/lib/agents/legalResearch'
import { draftEmailReply } from '@/lib/agents/emailDrafting'
import { openai } from '@/lib/openai'
import { getAgentSettings, logAudit } from '@/lib/supabase'
import { AGENT_LANGUAGES } from '@/lib/types'
import type { OrchestrationRequest } from '@/lib/types'

const BASE_PROMPT = `You are Sovereign, the Supreme Orchestrator of the Lex Sovereign AI Brain — a legal research and drafting assistant.
You coordinate Lex (Legal Research Agent) and Aria (Email Drafting Agent).

Synthesise agent outputs into a clear, human-friendly response. Structure as:
- What I found for you
- Key rights and relevant law (cite source from knowledge base)
- What you can do next
- Any important warnings

Never fabricate law, statutes, or legal citations. Always remind the user this is a research tool, not legal advice. Speak directly to the user in first person — as Sovereign.`

function buildPrompt(language: string): string {
  if (language === 'en') return BASE_PROMPT
  const langName = AGENT_LANGUAGES[language] ?? language
  return `${BASE_PROMPT}\n\nCRITICAL: Respond entirely in ${langName}.`
}

function friendlyError(err: unknown): string {
  const msg = (err as Error)?.message ?? String(err)
  if (msg.includes('401') || msg.includes('Incorrect API key') || msg.includes('invalid_api_key')) {
    return 'OpenAI API key is invalid. Go to Vercel → Settings → Environment Variables and check OPENAI_API_KEY.'
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit') || msg.includes('billing')) {
    return 'OpenAI API quota exceeded or no billing. Go to platform.openai.com → Billing and add credit (min $5).'
  }
  if (msg.includes('insufficient_quota')) {
    return 'OpenAI account has no credit. Visit platform.openai.com → Billing → Add payment method.'
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('fetch')) {
    return 'Cannot reach OpenAI. Check your internet connection and try again.'
  }
  return `AI error: ${msg.slice(0, 200)}`
}

export async function POST(req: NextRequest) {
  let body: OrchestrationRequest
  try { body = await req.json() } catch {
    return new Response('data: {"type":"error","message":"Invalid request"}\n\n', {
      status: 400, headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  if (!body.query?.trim()) {
    return new Response('data: {"type":"error","message":"Please type a question first."}\n\n', {
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

      await send({ type: 'status', agent: 'orchestrator', message: 'Sovereign activated — routing your request' })

      const lower = body.query.toLowerCase()
      const wantsResearch = !body.email_id ||
        /research|statute|law|right|define|find|what|how|mean|explain|ucc|fdcpa|fcra|habeas|amendment/.test(lower)
      const wantsDraft = !!body.email_id

      const agentsUsed = ['Supreme Orchestrator']
      let researchResult: Awaited<ReturnType<typeof runLegalResearch>> | null = null
      let draftResult:    Awaited<ReturnType<typeof draftEmailReply>>   | null = null

      if (wantsResearch) {
        await send({ type: 'status', agent: 'legal_research', message: 'Lex searching knowledge base and statutes…' })
        try {
          researchResult = await runLegalResearch(body.query)
          agentsUsed.push('Legal Research Agent')
          await send({
            type: 'research_done',
            sources: researchResult.sources.length,
            memory_matches: researchResult.memoryMatches,
            unsupported_flags: researchResult.unsupportedFlags.length,
          })
          if (researchResult.sources.length === 0) {
            await send({ type: 'status', agent: 'legal_research',
              message: 'Lex: No matching statutes found — knowledge base may need seeding (go to /setup)' })
          }
        } catch (err) {
          await send({ type: 'agent_error', agent: 'legal_research', message: friendlyError(err) })
        }
      }

      if (wantsDraft && body.email_id) {
        await send({ type: 'status', agent: 'email_drafting', message: 'Aria analysing email and drafting reply…' })
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
          await send({ type: 'agent_error', agent: 'email_drafting', message: friendlyError(err) })
        }
      }

      const contextParts: string[] = []
      if (researchResult) {
        contextParts.push(`Lex found:\n${researchResult.answer}`)
        if (researchResult.unsupportedFlags.length > 0) {
          contextParts.push(`Risk flags:\n${researchResult.unsupportedFlags
            .map(f => `- [${f.severity.toUpperCase()}] ${f.reason}`).join('\n')}`)
        }
      }
      if (draftResult) {
        contextParts.push(`Aria drafted a reply — risk ${draftResult.draft.risk_score}/100. Awaiting your approval.`)
      }
      if (!researchResult && !draftResult) {
        contextParts.push('No agent results available. Responding from general knowledge only.')
      }

      await send({ type: 'status', agent: 'orchestrator', message: 'Sovereign synthesising final response…' })

      try {
        const messages: any[] = [{ role: 'system', content: systemPrompt }]
        if (contextParts.length > 0) {
          messages.push({ role: 'user', content: contextParts.join('\n\n') })
          messages.push({ role: 'assistant', content: 'Agent results received. Preparing your response now.' })
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
      } catch (openaiErr) {
        const msg = friendlyError(openaiErr)
        await send({ type: 'token', content: `\n\n⚠️ ${msg}` })
        await send({ type: 'error', message: msg })
        return
      }

      const allFlags = [
        ...(researchResult?.unsupportedFlags ?? []),
        ...(draftResult?.draft.risk_flags ?? []),
      ]

      await logAudit({
        agentName: 'Supreme Orchestrator',
        action: 'stream_orchestration_completed',
        details: { agents_used: agentsUsed, risk_flags: allFlags.length },
      })

      await send({
        type: 'done',
        agents_used: agentsUsed,
        risk_flags: allFlags,
        requires_approval: !!draftResult,
        approval_id: draftResult?.approval.id ?? null,
      })
    } catch (err) {
      await send({ type: 'error', message: friendlyError(err) })
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

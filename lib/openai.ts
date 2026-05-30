import OpenAI from 'openai'
import type { RiskFlag } from './types'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// ── Embeddings ────────────────────────────────────────────────────────────────

export async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.slice(0, 8000),
  })
  return res.data[0].embedding
}

// ── Non-streaming chat (agents, classifiers) ──────────────────────────────────

export async function chat(
  systemPrompt: string,
  userMessage: string,
  context?: string
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ]
  if (context) {
    messages.push({ role: 'user', content: `Context:\n${context}` })
    messages.push({ role: 'assistant', content: 'Understood. I will use this context.' })
  }
  messages.push({ role: 'user', content: userMessage })

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.2,
    max_tokens: 4096,
  })
  return res.choices[0].message.content ?? ''
}

// ── Streaming chat (dashboard real-time responses) ────────────────────────────

export async function* streamChat(
  systemPrompt: string,
  userMessage: string,
  context?: string
): AsyncGenerator<string, void, unknown> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ]
  if (context) {
    messages.push({ role: 'user', content: `Context:\n${context}` })
    messages.push({ role: 'assistant', content: 'Understood. I have reviewed all agent outputs.' })
  }
  messages.push({ role: 'user', content: userMessage })

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,
    temperature: 0.2,
    max_tokens: 4096,
  })

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? ''
    if (token) yield token
  }
}

// ── Risk checker ──────────────────────────────────────────────────────────────

export async function checkRisks(draftText: string, knownFacts: string[]): Promise<{
  flags: RiskFlag[]
  score: number
}> {
  const factsBlock = knownFacts.length
    ? `\nVerified facts in knowledge base:\n${knownFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    : '\nNo verified facts provided.'

  const prompt = `You are a risk-checking assistant for a LEGAL RESEARCH AND DRAFTING ASSISTANT (not a lawyer).
Analyse the draft reply below and identify risky statements.
${factsBlock}

Return valid JSON only — no markdown:
{
  "flags": [
    {
      "type": "unsupported_claim|unverified_citation|legal_demand|statute_reference|threat|pii",
      "severity": "low|medium|high",
      "text": "excerpt from draft",
      "reason": "why this is a risk"
    }
  ],
  "score": 0
}

Risk score: 0 = no risk, 100 = extremely risky.
Flag anything that: cites a statute not in verified facts, makes unsourced legal claims,
contains unintended PII, threatens legal action without verified basis, or demands payment without lawful basis.

Draft:
${draftText}`

  try {
    const raw = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(raw.choices[0].message.content ?? '{}')
    return {
      flags: (parsed.flags ?? []) as RiskFlag[],
      score: Math.min(100, Math.max(0, Number(parsed.score ?? 0))),
    }
  } catch {
    return { flags: [], score: 0 }
  }
}

// ── Email classifier ──────────────────────────────────────────────────────────

export async function classifyEmail(subject: string, body: string): Promise<{
  category: 'legal' | 'debt_collector' | 'government' | 'court' | 'general'
  is_critical: boolean
  urgency: 'low' | 'normal' | 'high' | 'critical'
  reason: string
}> {
  const prompt = `Classify this email. Return valid JSON only:
{
  "category": "legal|debt_collector|government|court|general",
  "is_critical": true|false,
  "urgency": "low|normal|high|critical",
  "reason": "brief explanation"
}

is_critical = true when from court, law firm, debt collector, government agency, or IRS.
urgency = critical when there is a deadline, lawsuit, or legal threat.

Subject: ${subject}
Body: ${body.slice(0, 1500)}`

  try {
    const raw = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    })
    return JSON.parse(raw.choices[0].message.content ?? '{}')
  } catch {
    return { category: 'general', is_critical: false, urgency: 'normal', reason: '' }
  }
}

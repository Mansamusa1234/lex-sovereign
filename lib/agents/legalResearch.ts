import { supabaseAdmin, logAudit, getAgentSettings } from '../supabase'
import { embed, chat } from '../openai'
import { AGENT_LANGUAGES } from '../types'
import type { KnowledgeSearchResult, RiskFlag } from '../types'

const BASE_SYSTEM_PROMPT = `You are the Legal Research Agent within the Lex Sovereign AI Brain system.
You are a legal research and drafting assistant — NOT a lawyer.
You do NOT provide legal advice.

Your role:
1. Search the knowledge base (statutes, case law, Black's Law Dictionary, templates) for relevant information
2. Synthesise findings into clear, factual summaries
3. Always cite the exact source from the knowledge base — never fabricate citations
4. Flag any claim that is NOT supported by a verified source
5. Use plain language the user can understand

Rules you must never break:
- Never invent statutes, case citations, or legal quotes
- If information is not in the knowledge base, say the equivalent of "Not found in knowledge base — consult an attorney"
- Do not provide strategic legal advice
- Always note when the user should seek qualified legal counsel`

function buildSystemPrompt(language: string): string {
  if (language === 'en') return BASE_SYSTEM_PROMPT
  const langName = AGENT_LANGUAGES[language] ?? language
  return `${BASE_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE INSTRUCTION: You MUST respond entirely in ${langName}. All output — summaries, citations, warnings, and notes — must be written in ${langName}. Do not switch to English.`
}

// ── Search knowledge base via pgvector ───────────────────────────────────────

export async function searchKnowledge(
  query: string,
  category?: string,
  limit = 5
): Promise<KnowledgeSearchResult[]> {
  const embedding = await embed(query)
  const { data, error } = await supabaseAdmin.rpc('search_knowledge', {
    query_embedding: embedding,
    match_count: limit,
    filter_category: category ?? null,
  })
  if (error) { console.error('Knowledge search error:', error); return [] }
  return (data as KnowledgeSearchResult[]) ?? []
}

// ── Search uploaded documents ─────────────────────────────────────────────────

export async function searchDocuments(query: string, limit = 3): Promise<Array<{
  id: string; filename: string; content: string; similarity: number
}>> {
  const embedding = await embed(query)
  const { data, error } = await supabaseAdmin.rpc('search_documents', {
    query_embedding: embedding,
    match_count: limit,
  })
  if (error) return []
  return data ?? []
}

// ── Search shared memory ──────────────────────────────────────────────────────

export async function searchMemory(query: string, limit = 5): Promise<Array<{
  id: string; content: string; category: string; similarity: number
}>> {
  const embedding = await embed(query)
  const { data, error } = await supabaseAdmin.rpc('search_memory', {
    query_embedding: embedding,
    match_count: limit,
    filter_category: null,
  })
  if (error) return []
  return data ?? []
}

// ── Add to shared memory ──────────────────────────────────────────────────────

export async function addMemory(
  content: string,
  category: string,
  metadata: Record<string, unknown> = {}
) {
  const embedding = await embed(content)
  const { data } = await supabaseAdmin
    .from('agents').select('id').eq('type', 'legal_research').single()
  await supabaseAdmin.from('memory').insert({
    agent_id: data?.id ?? null,
    content, category, embedding, metadata,
  })
}

// ── Main research function ────────────────────────────────────────────────────

export async function runLegalResearch(query: string): Promise<{
  answer: string
  sources: KnowledgeSearchResult[]
  memoryMatches: number
  unsupportedFlags: RiskFlag[]
  language: string
}> {
  // Fetch this agent's language setting
  const settings = await getAgentSettings('legal_research')
  const systemPrompt = buildSystemPrompt(settings.language)

  await logAudit({
    agentName: 'Legal Research Agent',
    action: 'research_started',
    details: { query: query.slice(0, 200), language: settings.language },
  })

  const [knowledgeResults, docResults, memoryResults] = await Promise.all([
    searchKnowledge(query, undefined, 6),
    searchDocuments(query, 3),
    searchMemory(query, 4),
  ])

  const contextParts: string[] = []

  if (knowledgeResults.length > 0) {
    contextParts.push('=== KNOWLEDGE BASE ===')
    knowledgeResults.forEach((r, i) => {
      contextParts.push(`[KB-${i + 1}] ${r.title} (${r.category}${r.source ? ` — ${r.source}` : ''})`)
      contextParts.push(r.content.slice(0, 800))
      contextParts.push('')
    })
  }

  if (docResults.length > 0) {
    contextParts.push('=== UPLOADED DOCUMENTS ===')
    docResults.forEach((d, i) => {
      contextParts.push(`[DOC-${i + 1}] ${d.filename}`)
      contextParts.push(d.content?.slice(0, 600) ?? '')
      contextParts.push('')
    })
  }

  if (memoryResults.length > 0) {
    contextParts.push('=== PAST MEMORY ===')
    memoryResults.forEach((m, i) => {
      contextParts.push(`[MEM-${i + 1}] (${m.category}) ${m.content.slice(0, 400)}`)
    })
  }

  const context = contextParts.join('\n')
  const answer = await chat(
    systemPrompt,
    query,
    context || 'No relevant information found in knowledge base.'
  )

  const unsupportedFlags: RiskFlag[] = []
  if (knowledgeResults.length === 0 && docResults.length === 0) {
    unsupportedFlags.push({
      type: 'unsupported_claim',
      severity: 'high',
      text: query,
      reason: 'No matching entries found in the knowledge base. Response is based on model training data only — verify independently.',
    })
  }

  if (knowledgeResults.length > 0) {
    await addMemory(
      `Research on: "${query}" — Found: ${knowledgeResults.map(r => r.title).join(', ')}`,
      'other',
      { query, source_count: knowledgeResults.length, language: settings.language }
    )
  }

  await logAudit({
    agentName: 'Legal Research Agent',
    action: 'research_completed',
    details: {
      query: query.slice(0, 200),
      sources_found: knowledgeResults.length,
      unsupported_flags: unsupportedFlags.length,
      language: settings.language,
    },
  })

  return {
    answer,
    sources: knowledgeResults,
    memoryMatches: memoryResults.length,
    unsupportedFlags,
    language: settings.language,
  }
}

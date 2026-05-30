import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { openai, embed } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Rotating topics — the AI auto-researches and adds these weekly
const WEEKLY_TOPICS = [
  { area: 'Employment Rights UK', focus: 'Constructive dismissal and wrongful termination claims' },
  { area: 'Housing Rights', focus: 'Tenant rights against illegal eviction and disrepair' },
  { area: 'Data Protection Rights', focus: 'GDPR Subject Access Requests and data erasure rights' },
  { area: 'Police Accountability', focus: 'IOPC complaints process and police misconduct remedies' },
  { area: 'Benefits Appeals', focus: 'Universal Credit appeals and mandatory reconsideration process' },
  { area: 'Consumer Contract Law', focus: 'Unfair contract terms and misrepresentation claims' },
  { area: 'Mental Health Rights', focus: 'Section 136 PACE and Mental Health Act rights' },
  { area: 'Immigration Rights', focus: 'Right to appeal deportation and ECHR Article 8' },
  { area: 'Bankruptcy and Insolvency', focus: 'Automatic stay protections and debt discharge rights' },
  { area: 'Small Claims Procedure', focus: 'Filing and winning small claims without a solicitor' },
  { area: 'Criminal Procedure Rights', focus: 'Rights at police interview and CJPOA 1994 Section 34' },
  { area: 'Equality Act 2010', focus: 'Disability discrimination and reasonable adjustments' },
]

async function generateKnowledgeEntry(topic: { area: string; focus: string }) {
  const prompt = `You are a legal research expert. Generate a detailed, accurate knowledge base entry about: "${topic.focus}" in the area of "${topic.area}".

Format your response as JSON:
{
  "title": "concise title under 80 chars",
  "content": "500-800 word detailed explanation covering: what the law says, key rights, practical steps, relevant statutes/cases, and important warnings. Include specific section numbers where relevant.",
  "category": "statute|case_law|definition|template|strategy|outcome",
  "source": "primary legal source e.g. 'Employment Rights Act 1996' or 'Equality Act 2010 s.20'",
  "tags": ["array", "of", "5-8", "keywords"]
}

Requirements:
- Only include verifiable, accurate legal information
- Cite real statutes and cases with correct references
- Include practical actionable guidance
- Note any important limitations or when to seek professional advice
- UK and US law where applicable`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  })

  return JSON.parse(res.choices[0].message.content ?? '{}')
}

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = []

  // Pick topic based on week number
  const week = Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % WEEKLY_TOPICS.length
  const topic = WEEKLY_TOPICS[week]

  try {
    // Check if we already have something on this topic recently
    const { data: existing } = await supabaseAdmin
      .from('knowledge')
      .select('id')
      .ilike('title', `%${topic.area.split(' ')[0]}%`)
      .limit(1)

    if (existing && existing.length > 0) {
      // Pick a different angle — generate 2 new entries on adjacent topics
      const adjacentIndex = (week + 1) % WEEKLY_TOPICS.length
      const adjacentTopic = WEEKLY_TOPICS[adjacentIndex]

      const entry = await generateKnowledgeEntry(adjacentTopic)
      if (entry.title && entry.content) {
        const embedding = await embed(`${entry.title}\n${entry.content}`)
        await supabaseAdmin.from('knowledge').insert({
          title: `[Auto] ${entry.title}`,
          content: entry.content,
          category: entry.category ?? 'statute',
          source: entry.source ?? adjacentTopic.area,
          tags: [...(entry.tags ?? []), 'auto-generated', 'weekly-update'],
          embedding,
        })
        results.push(entry.title)
      }
    } else {
      const entry = await generateKnowledgeEntry(topic)
      if (entry.title && entry.content) {
        const embedding = await embed(`${entry.title}\n${entry.content}`)
        await supabaseAdmin.from('knowledge').insert({
          title: `[Auto] ${entry.title}`,
          content: entry.content,
          category: entry.category ?? 'statute',
          source: entry.source ?? topic.area,
          tags: [...(entry.tags ?? []), 'auto-generated', 'weekly-update'],
          embedding,
        })
        results.push(entry.title)
      }
    }

    await logAudit({
      action: 'cron_auto_knowledge',
      details: { added: results.length, topic: topic.area, titles: results },
    })

    return NextResponse.json({ success: true, added: results.length, entries: results })
  } catch (err) {
    console.error('Cron knowledge error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

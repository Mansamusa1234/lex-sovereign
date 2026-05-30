import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { openai } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Daily "Insight of the Day" — auto-generated legal tip
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const topics = [
    'debt collection defense tactics', 'credit report dispute tips',
    'know your police rights', 'housing tenant rights',
    'employment discrimination', 'consumer refund rights UK',
    'government benefit appeals', 'court procedure self-representation',
    'UCC commercial law rights', 'constitutional due process',
    'data protection subject access requests', 'small claims court tips',
  ]

  const today = new Date()
  const topic = topics[today.getDate() % topics.length]

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Generate a "Legal Insight of the Day" about: ${topic}

Return JSON:
{
  "headline": "Short punchy headline under 60 chars",
  "insight": "2-3 sentences of genuinely useful legal insight with a specific statute or right cited",
  "action": "One specific action the reader can take right now",
  "source": "The law or statute this is based on"
}

Be accurate, specific, and empowering. Not legal advice disclaimer at the end.`
      }],
      temperature: 0.6,
      response_format: { type: 'json_object' },
      max_tokens: 400,
    })

    const insight = JSON.parse(res.choices[0].message.content ?? '{}')

    // Store in a simple key-value in the audit log for retrieval
    await supabaseAdmin.from('audit_log').insert({
      action: 'daily_insight',
      entity_type: 'insight',
      details: {
        date: today.toISOString().split('T')[0],
        topic,
        ...insight,
      },
    })

    await logAudit({
      action: 'cron_daily_insight',
      details: { topic, headline: insight.headline },
    })

    return NextResponse.json({ success: true, insight })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

import { supabaseAdmin, logAudit, getAgentSettings } from '../supabase'
import { chat, checkRisks, classifyEmail } from '../openai'
import { searchKnowledge, searchMemory, addMemory } from './legalResearch'
import { AGENT_LANGUAGES } from '../types'
import type { Email, Draft, Approval } from '../types'

const BASE_DRAFT_PROMPT = `You are the Email Drafting Agent within the Lex Sovereign AI Brain system.
You are a legal research and drafting assistant — NOT a lawyer.

When drafting replies:
1. Be professional, calm, and firm
2. Request validation / debt verification / proof of claim where appropriate
3. Cite ONLY statutes or rights that appear in the provided knowledge base context
4. Do NOT fabricate any law, statute, case citation, or legal quote
5. Use plain language
6. If the email is from a court or contains a lawsuit, note: "IMPORTANT: This response should be reviewed by a qualified attorney before sending."
7. Structure the reply clearly: opening, body, closing, signature line placeholder
8. Keep the tone factual — never threatening or emotional

CRITICAL: You are drafting only. A human must approve before anything is sent.`

function buildDraftPrompt(language: string): string {
  if (language === 'en') return BASE_DRAFT_PROMPT
  const langName = AGENT_LANGUAGES[language] ?? language
  return `${BASE_DRAFT_PROMPT}\n\nCRITICAL LANGUAGE INSTRUCTION: Draft the entire reply in ${langName}. All text in the draft — including headers, body, signature lines, and legal notices — must be written in ${langName}.`
}

// ── Classify and save a new email ─────────────────────────────────────────────

export async function processIncomingEmail(gmailMessage: {
  id: string
  threadId: string
  subject: string
  sender: string
  recipient: string
  body: string
  date: string
}): Promise<Email> {
  const classification = await classifyEmail(gmailMessage.subject, gmailMessage.body)

  const { data, error } = await supabaseAdmin
    .from('emails')
    .upsert({
      gmail_id: gmailMessage.id,
      thread_id: gmailMessage.threadId,
      subject: gmailMessage.subject,
      sender: gmailMessage.sender,
      recipient: gmailMessage.recipient,
      body: gmailMessage.body,
      received_at: gmailMessage.date
        ? new Date(gmailMessage.date).toISOString()
        : new Date().toISOString(),
      category: classification.category,
      is_critical: classification.is_critical,
      processed: false,
    }, { onConflict: 'gmail_id', ignoreDuplicates: false })
    .select()
    .single()

  if (error) throw new Error(`Failed to save email: ${error.message}`)

  await logAudit({
    agentName: 'Email Drafting Agent',
    action: 'email_classified',
    entity_type: 'email',
    entity_id: data.id,
    details: {
      subject: gmailMessage.subject,
      category: classification.category,
      is_critical: classification.is_critical,
    },
  })

  return data as Email
}

// ── Draft a reply to an email ─────────────────────────────────────────────────

export async function draftEmailReply(emailId: string): Promise<{
  draft: Draft
  approval: Approval
}> {
  // Fetch this agent's language setting
  const settings = await getAgentSettings('email_drafting')
  const systemPrompt = buildDraftPrompt(settings.language)

  const { data: emailData, error: emailErr } = await supabaseAdmin
    .from('emails').select('*').eq('id', emailId).single()

  if (emailErr || !emailData) throw new Error('Email not found')
  const email = emailData as Email

  await logAudit({
    agentName: 'Email Drafting Agent',
    action: 'draft_started',
    entity_type: 'email',
    entity_id: email.id,
    details: { subject: email.subject, category: email.category, language: settings.language },
  })

  const [knowledgeResults, memoryResults] = await Promise.all([
    searchKnowledge(`${email.subject} ${email.body.slice(0, 400)}`, undefined, 5),
    searchMemory(email.subject, 3),
  ])

  const contextParts: string[] = []
  if (knowledgeResults.length > 0) {
    contextParts.push('Relevant knowledge base entries:')
    knowledgeResults.forEach(k => {
      contextParts.push(`- ${k.title} (${k.category}): ${k.content.slice(0, 400)}`)
    })
  }
  if (memoryResults.length > 0) {
    contextParts.push('\nRelevant past experience:')
    memoryResults.forEach(m => {
      contextParts.push(`- ${m.content.slice(0, 300)}`)
    })
  }
  contextParts.push(`\nOriginal email:\nFrom: ${email.sender}\nSubject: ${email.subject}\n\n${email.body}`)

  const draftBody = await chat(
    systemPrompt,
    'Draft a reply to this email.',
    contextParts.join('\n')
  )

  const verifiedFacts = knowledgeResults.map(k => `${k.title}: ${k.content.slice(0, 150)}`)
  const { flags, score } = await checkRisks(draftBody, verifiedFacts)

  const { data: draftData, error: draftErr } = await supabaseAdmin
    .from('drafts')
    .insert({
      email_id: email.id,
      subject: `Re: ${email.subject}`,
      body: draftBody,
      generated_by: 'Email Drafting Agent',
      risk_score: score,
      risk_flags: flags,
      status: 'pending',
    })
    .select()
    .single()

  if (draftErr || !draftData) throw new Error(`Failed to save draft: ${draftErr?.message}`)
  const draft = draftData as Draft

  const urgency =
    email.category === 'court'          ? 'critical' :
    email.category === 'legal' ||
    email.category === 'government'     ? 'high' :
    email.category === 'debt_collector' ? 'high' :
    score > 60                          ? 'high' :
    score > 30                          ? 'normal' : 'low'

  const approvalReason =
    email.is_critical
      ? `Critical email from ${email.category?.replace('_', ' ')} — human review required before sending`
      : score > 30
      ? `Risk score ${score}/100 — contains potentially unsupported claims`
      : 'Standard review: all outgoing correspondence requires approval'

  const { data: approvalData, error: approvalErr } = await supabaseAdmin
    .from('approvals')
    .insert({ draft_id: draft.id, urgency, reason: approvalReason })
    .select()
    .single()

  if (approvalErr || !approvalData) throw new Error(`Failed to create approval: ${approvalErr?.message}`)

  await supabaseAdmin.from('emails').update({ processed: true }).eq('id', email.id)

  await logAudit({
    agentName: 'Email Drafting Agent',
    action: 'draft_created',
    entity_type: 'draft',
    entity_id: draft.id,
    details: {
      email_id: email.id,
      risk_score: score,
      risk_flag_count: flags.length,
      urgency,
      language: settings.language,
    },
  })

  return { draft, approval: approvalData as Approval }
}

// ── Save human edit as learning memory ────────────────────────────────────────

export async function saveHumanEdit(
  draftId: string,
  editedBody: string,
  originalBody: string
) {
  const { data: draft } = await supabaseAdmin
    .from('drafts').select('*, email:emails(*)').eq('id', draftId).single()

  if (!draft) return

  const memoryContent = `Human edited draft reply to "${(draft.email as Email)?.subject ?? 'unknown subject'}".
Original AI draft summary: ${originalBody.slice(0, 200)}
Human changes: ${editedBody.slice(0, 300)}
Category: ${(draft.email as Email)?.category ?? 'general'}`

  await addMemory(memoryContent, 'strategy', {
    draft_id: draftId,
    email_category: (draft.email as Email)?.category,
    learned_at: new Date().toISOString(),
  })

  await logAudit({
    agentName: 'Email Drafting Agent',
    action: 'human_edit_saved_as_memory',
    entity_type: 'draft',
    entity_id: draftId,
    details: { email_category: (draft.email as Email)?.category },
  })
}

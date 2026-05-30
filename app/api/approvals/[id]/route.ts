import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { saveHumanEdit } from '@/lib/agents/emailDrafting'
import { createGmailDraft } from '@/lib/gmail'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const { data, error } = await supabaseAdmin
    .from('approvals')
    .select('*, draft:drafts(*, email:emails(*))')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ approval: data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json()
  const { decision, notes, edited_body, reviewer = 'user' } = body

  if (!['approved', 'rejected'].includes(decision)) {
    return NextResponse.json({ error: 'decision must be approved or rejected' }, { status: 400 })
  }

  // Load approval + draft + email
  const { data: approval, error: loadErr } = await supabaseAdmin
    .from('approvals')
    .select('*, draft:drafts(*, email:emails(*))')
    .eq('id', params.id)
    .single()

  if (loadErr || !approval) return NextResponse.json({ error: 'Approval not found' }, { status: 404 })

  const draft = approval.draft as any
  const email = draft?.email as any

  // If human edited the body, save as learning memory
  if (edited_body && edited_body !== draft.body) {
    await saveHumanEdit(draft.id, edited_body, draft.body)
    // Update draft with human edit
    await supabaseAdmin
      .from('drafts')
      .update({ human_edit: edited_body, updated_at: new Date().toISOString() })
      .eq('id', draft.id)
  }

  const finalBody = edited_body ?? draft.body

  // If approved, push to Gmail as a DRAFT (not sent)
  let gmailDraftId: string | null = null
  if (decision === 'approved' && email?.gmail_id) {
    try {
      gmailDraftId = await createGmailDraft({
        to: email.sender,
        subject: draft.subject,
        body: finalBody,
        threadId: email.thread_id ?? undefined,
      })
    } catch (gmailErr) {
      console.error('Gmail draft creation failed:', gmailErr)
      // Non-fatal — the approval still goes through
    }
  }

  // Update draft status
  await supabaseAdmin
    .from('drafts')
    .update({
      status: decision === 'approved' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', draft.id)

  // Update approval record
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('approvals')
    .update({
      decision,
      notes: notes ?? null,
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  await logAudit({
    action: `draft_${decision}`,
    entity_type: 'approval',
    entity_id: params.id,
    details: {
      draft_id: draft.id,
      email_id: email?.id,
      had_human_edit: !!edited_body,
      gmail_draft_id: gmailDraftId,
    },
    user_id: reviewer,
  })

  return NextResponse.json({
    approval: updated,
    gmail_draft_created: !!gmailDraftId,
    gmail_draft_id: gmailDraftId,
  })
}

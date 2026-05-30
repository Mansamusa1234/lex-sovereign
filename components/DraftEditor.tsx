'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Edit3, Loader2, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import RiskBadge from './RiskBadge'
import type { Approval } from '@/lib/types'

interface Props {
  approval: Approval
  onDecision: (decision: 'approved' | 'rejected', editedBody?: string, notes?: string) => Promise<void>
}

export default function DraftEditor({ approval, onDecision }: Props) {
  const draft = approval.draft!
  const email = draft.email

  const [editing, setEditing] = useState(false)
  const [editedBody, setEditedBody] = useState(draft.human_edit ?? draft.body)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)

  async function handle(decision: 'approved' | 'rejected') {
    setLoading(decision)
    try {
      await onDecision(
        decision,
        editing && editedBody !== draft.body ? editedBody : undefined,
        notes || undefined
      )
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Original Email */}
      {email && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Original Email</h3>
          <p className="text-slate-300 text-sm font-medium">{email.subject}</p>
          <p className="text-slate-500 text-xs mt-1">From: {email.sender}</p>
          {email.received_at && (
            <p className="text-slate-600 text-xs">{new Date(email.received_at).toLocaleString()}</p>
          )}
          <pre className="text-slate-400 text-sm mt-3 whitespace-pre-wrap font-sans leading-relaxed border-t border-slate-700 pt-3">
            {email.body.slice(0, 2000)}{email.body.length > 2000 ? '\n[...]' : ''}
          </pre>
        </div>
      )}

      {/* Risk warning */}
      <div>
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Risk Assessment</h3>
        <RiskBadge score={draft.risk_score} flags={draft.risk_flags} />
      </div>

      {/* Critical notice */}
      {approval.urgency === 'critical' && (
        <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Critical Review Required</p>
            <p className="text-red-400/80 text-xs mt-1">{approval.reason}</p>
            <p className="text-red-400/60 text-xs mt-1">Consider consulting a qualified attorney before approving.</p>
          </div>
        </div>
      )}

      {/* AI Draft */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide">AI Draft Reply</h3>
          <button
            onClick={() => setEditing(e => !e)}
            className={clsx(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors',
              editing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            )}
          >
            <Edit3 className="w-3 h-3" />
            {editing ? 'Editing' : 'Edit Draft'}
          </button>
        </div>
        <div className="p-5">
          {editing ? (
            <textarea
              value={editedBody}
              onChange={e => setEditedBody(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-sm text-white font-sans leading-relaxed resize-y min-h-[300px] focus:outline-none focus:border-amber-500/50"
              spellCheck
            />
          ) : (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {editedBody}
            </pre>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Review Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add any notes about your decision..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-600 resize-none h-20 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => handle('approved')}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl transition-colors text-sm"
        >
          {loading === 'approved'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle className="w-4 h-4" />}
          Approve & Push to Gmail Draft
        </button>
        <button
          onClick={() => handle('rejected')}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 font-semibold border border-red-500/30 rounded-xl transition-colors text-sm"
        >
          {loading === 'rejected'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <XCircle className="w-4 h-4" />}
          Reject
        </button>
      </div>
      <p className="text-slate-600 text-xs text-center">
        Approving creates a Gmail draft. Nothing is sent automatically.
      </p>
    </div>
  )
}

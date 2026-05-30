'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Mail, RefreshCw, AlertTriangle, Eye, Loader2, Send, Plus, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import type { Email } from '@/lib/types'

const catColors: Record<string, string> = {
  legal:          'bg-red-500/10 text-red-400 border-red-500/30',
  debt_collector: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  government:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  court:          'bg-purple-500/10 text-purple-400 border-purple-500/30',
  general:        'bg-slate-800 text-slate-400 border-slate-700',
}

const BLANK_MANUAL = { subject: '', sender: '', body: '' }

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [drafting, setDrafting] = useState<string | null>(null)
  const [viewed, setViewed] = useState<Email | null>(null)
  const [syncResult, setSyncResult] = useState('')
  const [syncError, setSyncError] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState(BLANK_MANUAL)
  const [savingManual, setSavingManual] = useState(false)

  async function load() {
    const res = await fetch('/api/emails/list?limit=50')
    const data = await res.json()
    setEmails(data.emails ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function sync() {
    setSyncing(true)
    setSyncResult('')
    setSyncError('')
    try {
      const res = await fetch('/api/emails/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxResults: 20 }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSyncResult(`Synced ${data.synced} email(s) from Gmail.`)
      await load()
    } catch (err) {
      setSyncError(`Gmail sync failed: ${(err as Error).message}. If Gmail is not set up, add emails manually below.`)
    } finally {
      setSyncing(false)
    }
  }

  async function saveManualEmail() {
    if (!manual.subject.trim() || !manual.sender.trim() || !manual.body.trim()) return
    setSavingManual(true)
    try {
      const res = await fetch('/api/emails/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manual),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setManual(BLANK_MANUAL)
      setShowManual(false)
      await load()
    } catch (err) {
      alert(`Failed: ${(err as Error).message}`)
    } finally {
      setSavingManual(false)
    }
  }

  async function analyzeDraft(emailId: string) {
    setDrafting(emailId)
    try {
      const res = await fetch('/api/emails/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_id: emailId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = `/approvals/${data.approval.id}`
    } catch (err) {
      alert(`Draft failed: ${(err as Error).message}`)
      setDrafting(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Emails</h1>
              <p className="text-slate-400 text-sm mt-1">
                Sync your Gmail inbox or add emails manually. Analyze critical emails to generate draft replies.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setShowManual(s => !s)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2.5 border font-medium rounded-xl text-sm transition-colors',
                  showManual
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                )}>
                {showManual ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showManual ? 'Cancel' : 'Add Manually'}
              </button>
              <button onClick={sync} disabled={syncing}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors disabled:opacity-50">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {syncing ? 'Syncing…' : 'Sync Gmail'}
              </button>
            </div>
          </div>

          {syncResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm">
              {syncResult}
            </div>
          )}
          {syncError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {syncError}{' '}
              <a href="/setup" className="underline text-red-300">Setup Gmail</a>
            </div>
          )}

          {/* Manual email form */}
          {showManual && (
            <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-6 space-y-4">
              <h2 className="text-white font-semibold">Add Email Manually</h2>
              <p className="text-slate-400 text-sm">
                Paste a letter or email you received. The AI will classify it and you can generate a draft reply.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Subject *</label>
                  <input
                    value={manual.subject}
                    onChange={e => setManual(m => ({ ...m, subject: e.target.value }))}
                    placeholder="e.g. Final Notice — Account 12345"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">From (sender) *</label>
                  <input
                    value={manual.sender}
                    onChange={e => setManual(m => ({ ...m, sender: e.target.value }))}
                    placeholder="e.g. collections@debtco.com or ABC Law Firm"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Email or Letter Body *</label>
                <textarea
                  value={manual.body}
                  onChange={e => setManual(m => ({ ...m, body: e.target.value }))}
                  placeholder="Paste the full text of the email or letter here..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 resize-y min-h-[160px] focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                onClick={saveManualEmail}
                disabled={savingManual || !manual.subject || !manual.sender || !manual.body}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
              >
                {savingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save Email
              </button>
            </div>
          )}

          {/* Email list */}
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-10 text-center">
              <Mail className="w-9 h-9 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No emails yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Sync Gmail or add an email manually using the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {emails.map(email => (
                <div key={email.id} className={clsx(
                  'bg-slate-900 rounded-xl border p-4 flex items-start gap-3 transition-colors',
                  email.is_critical
                    ? 'border-red-500/30 hover:border-red-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                )}>
                  {email.is_critical && (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {email.category && (
                        <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border capitalize', catColors[email.category])}>
                          {email.category.replace('_', ' ')}
                        </span>
                      )}
                      {email.processed && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Draft created
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{email.subject}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">From: {email.sender}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{email.body.slice(0, 120)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-slate-600 text-xs">
                      {email.received_at
                        ? formatDistanceToNow(new Date(email.received_at), { addSuffix: true })
                        : ''}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewed(email)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800"
                        title="View email"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {!email.processed && (
                        <button
                          onClick={() => analyzeDraft(email.id)}
                          disabled={drafting === email.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                        >
                          {drafting === email.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Send className="w-3 h-3" />}
                          Draft Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* View modal */}
      {viewed && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setViewed(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-medium">{viewed.subject}</p>
                <p className="text-slate-400 text-xs mt-0.5">From: {viewed.sender}</p>
              </div>
              <button onClick={() => setViewed(null)} className="text-slate-500 hover:text-white transition-colors mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-5 flex-1">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{viewed.body}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

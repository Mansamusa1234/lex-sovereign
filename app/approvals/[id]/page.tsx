'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DraftEditor from '@/components/DraftEditor'
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Approval } from '@/lib/types'

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [approval, setApproval] = useState<Approval | null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [gmailDraftCreated, setGmailDraftCreated] = useState(false)

  useEffect(() => {
    fetch(`/api/approvals/${params.id}`)
      .then(r => r.json())
      .then(d => { setApproval(d.approval); setLoading(false) })
  }, [params.id])

  async function onDecision(decision: 'approved' | 'rejected', editedBody?: string, notes?: string) {
    const res = await fetch(`/api/approvals/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, edited_body: editedBody, notes }),
    })
    const data = await res.json()
    setDone(decision)
    setGmailDraftCreated(data.gmail_draft_created ?? false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-slate-600" />
        </main>
      </div>
    )
  }

  if (!approval) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-300 font-medium">Approval not found</p>
            <Link href="/approvals" className="text-amber-400 text-sm mt-2 block">Back to approvals</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/approvals" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Review Draft</h1>
              <p className="text-slate-500 text-xs">Approval #{params.id.slice(0, 8)}</p>
            </div>
          </div>

          {done ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center space-y-4">
              {done === 'approved' ? (
                <>
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div>
                    <p className="text-white font-semibold text-lg">Draft Approved</p>
                    {gmailDraftCreated ? (
                      <p className="text-slate-400 text-sm mt-2">
                        The reply has been saved as a Gmail draft. Open Gmail to review and send it yourself.
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm mt-2">
                        Approval recorded. (Gmail draft creation skipped — no Gmail ID found.)
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-red-400 mx-auto" />
                  <div>
                    <p className="text-white font-semibold text-lg">Draft Rejected</p>
                    <p className="text-slate-400 text-sm mt-2">No draft was pushed to Gmail.</p>
                  </div>
                </>
              )}
              <Link href="/approvals"
                className="inline-block px-5 py-2.5 bg-amber-500 text-slate-950 font-semibold rounded-xl text-sm hover:bg-amber-400 transition-colors">
                Back to Queue
              </Link>
            </div>
          ) : (
            <DraftEditor approval={approval} onDecision={onDecision} />
          )}
        </div>
      </main>
    </div>
  )
}

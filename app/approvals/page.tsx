'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import ApprovalCard from '@/components/ApprovalCard'
import { Loader2, CheckSquare, Filter } from 'lucide-react'
import clsx from 'clsx'
import type { Approval } from '@/lib/types'

const TABS = ['pending', 'approved', 'rejected'] as const
type Tab = typeof TABS[number]

export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [res, countRes] = await Promise.all([
        fetch(`/api/approvals?status=${tab}&limit=100`).then(r => r.json()),
        fetch('/api/approvals?status=pending&limit=0').then(r => r.json()),
      ])
      setApprovals(res.approvals ?? [])
      setPendingCount((countRes.approvals ?? []).length)
      setLoading(false)
    }
    load()
  }, [tab])

  return (
    <div className="flex min-h-screen">
      <Sidebar pendingCount={pendingCount} />
      <MobileNav />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
            <p className="text-slate-400 text-sm mt-1">All AI-drafted replies must be reviewed here before reaching Gmail.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                  tab === t ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
              <CheckSquare className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No {tab} approvals</p>
              <p className="text-slate-500 text-sm mt-1">
                {tab === 'pending' ? 'Sync emails and analyze them to generate drafts.' : `No ${tab} items yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map(a => <ApprovalCard key={a.id} approval={a} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'
import { Fragment, useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { ClipboardList, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import type { AuditEntry } from '@/lib/types'

const agentColors: Record<string, string> = {
  orchestrator:   'text-orange-400 bg-orange-500/10 border-orange-500/30',
  legal_research: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  email_drafting: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/audit?limit=200')
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLoading(false) })
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="text-slate-400 text-sm mt-1">
              Complete record of every AI action — tamper-evident trail for accountability.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-10 text-center">
              <ClipboardList className="w-9 h-9 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No audit entries yet</p>
              <p className="text-slate-500 text-sm mt-1">Actions will appear here after the AI does work.</p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Time</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Agent</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Action</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Entity</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    // Fix: Fragment must carry the key, not the inner <tr>
                    <Fragment key={log.id}>
                      <tr
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      >
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                        </td>
                        <td className="px-4 py-3">
                          {log.agent ? (
                            <span className={clsx(
                              'text-xs px-2 py-0.5 rounded border font-medium',
                              agentColors[log.agent.type] ?? 'text-slate-400 bg-slate-800 border-slate-700'
                            )}>
                              {log.agent.name.replace(' Agent', '').replace('Supreme ', '')}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">System</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white font-medium capitalize">
                          {log.action.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs capitalize">
                          {log.entity_type ?? ''}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {expanded === log.id
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />}
                        </td>
                      </tr>
                      {expanded === log.id && Object.keys(log.details).length > 0 && (
                        <tr className="bg-slate-800/30 border-b border-slate-800/50">
                          <td colSpan={5} className="px-4 py-3">
                            <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

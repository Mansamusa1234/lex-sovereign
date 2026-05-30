'use client'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { AGENT_COLORS } from '@/lib/types'
import type { AuditEntry } from '@/lib/types'

function dotColor(agentColor?: string): string {
  return AGENT_COLORS[agentColor ?? 'amber']?.dot ?? 'bg-slate-500'
}

function friendlyAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface Props {
  entries: AuditEntry[]
}

export default function AgentActivity({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-4">Agent Activity</h2>
        <p className="text-slate-500 text-sm">
          No activity yet. Start by asking the AI a question or syncing emails.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <h2 className="text-white font-semibold mb-4">Agent Activity</h2>
      <ol className="relative space-y-4">
        {entries.map((entry, i) => {
          const agentColor = (entry.agent as any)?.color
          return (
            <li key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={clsx(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1',
                  dotColor(agentColor)
                )} />
                {i < entries.length - 1 && (
                  <div className="w-px flex-1 bg-slate-800 mt-1" />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-white font-medium">{friendlyAction(entry.action)}</p>
                    {entry.agent && (
                      <p className={clsx(
                        'text-xs font-medium mt-0.5',
                        AGENT_COLORS[agentColor]
                          ? AGENT_COLORS[agentColor].badge.split(' ').find(c => c.startsWith('text-')) ?? 'text-slate-500'
                          : 'text-slate-500'
                      )}>
                        {entry.agent.name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                {Object.keys(entry.details).length > 0 && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {Object.entries(entry.details)
                      .filter(([k]) => !['query'].includes(k))
                      .slice(0, 3)
                      .map(([k, v]) => `${k}: ${String(v).slice(0, 35)}`)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

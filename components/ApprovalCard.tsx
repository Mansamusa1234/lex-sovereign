import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import type { Approval } from '@/lib/types'

const urgencyConfig = {
  critical: { bar: 'bg-red-500',    badge: 'bg-red-500/10 text-red-400 border-red-500/30',    label: 'CRITICAL' },
  high:     { bar: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', label: 'HIGH' },
  normal:   { bar: 'bg-amber-500',  badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',  label: 'NORMAL' },
  low:      { bar: 'bg-slate-600',  badge: 'bg-slate-800 text-slate-400 border-slate-700',     label: 'LOW' },
}

interface Props { approval: Approval }

export default function ApprovalCard({ approval }: Props) {
  const draft = approval.draft
  const email = draft?.email
  const cfg = urgencyConfig[approval.urgency]

  return (
    <Link href={`/approvals/${approval.id}`}>
      <div className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors overflow-hidden group cursor-pointer">
        <div className={clsx('h-1', cfg.bar)} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx('text-xs font-bold px-2 py-0.5 rounded border', cfg.badge)}>
                  {cfg.label}
                </span>
                {email?.category && (
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 capitalize">
                    {email.category.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-white font-medium text-sm truncate">
                {draft?.subject ?? 'Draft reply'}
              </p>
              <p className="text-slate-400 text-xs mt-1 truncate">
                From: {email?.sender ?? 'Unknown'}
              </p>
              <p className="text-slate-500 text-xs mt-1 line-clamp-2">{approval.reason}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
            {draft && (
              <div className="flex items-center gap-1.5">
                {draft.risk_score > 30 && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                <span className={clsx('text-xs', draft.risk_score > 59 ? 'text-red-400' : draft.risk_score > 29 ? 'text-amber-400' : 'text-slate-500')}>
                  Risk: {draft.risk_score}/100
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600 text-xs ml-auto">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

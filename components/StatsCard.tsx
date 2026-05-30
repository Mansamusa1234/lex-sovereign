import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  accent?: 'amber' | 'red' | 'emerald' | 'blue'
  sub?: string
}

const accentMap = {
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20' },
  red:     { bg: 'bg-red-500/10',     icon: 'text-red-400',     border: 'border-red-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/20' },
}

export default function StatsCard({ title, value, icon: Icon, accent = 'amber', sub }: Props) {
  const c = accentMap[accent]
  return (
    <div className={clsx('bg-slate-900 rounded-xl border p-5 flex items-start gap-4', c.border)}>
      <div className={clsx('p-2.5 rounded-lg flex-shrink-0', c.bg)}>
        <Icon className={clsx('w-5 h-5', c.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

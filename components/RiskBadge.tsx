import clsx from 'clsx'
import type { RiskFlag } from '@/lib/types'

interface Props {
  score: number
  flags?: RiskFlag[]
  compact?: boolean
}

function scoreLabel(score: number) {
  if (score === 0) return { label: 'No risk', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  if (score < 30)  return { label: 'Low risk', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  if (score < 60)  return { label: 'Medium risk', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
  return              { label: 'High risk', color: 'text-red-400 bg-red-500/10 border-red-500/30' }
}

const flagColors: Record<string, string> = {
  high:   'bg-red-500/10 border-red-500/30 text-red-300',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  low:    'bg-slate-800 border-slate-700 text-slate-400',
}

export default function RiskBadge({ score, flags = [], compact = false }: Props) {
  const { label, color } = scoreLabel(score)
  return (
    <div>
      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', color)}>
        <span className={clsx('w-1.5 h-1.5 rounded-full', score > 59 ? 'bg-red-400' : score > 29 ? 'bg-amber-400' : 'bg-emerald-400')} />
        {label} ({score}/100)
      </span>

      {!compact && flags.length > 0 && (
        <ul className="mt-3 space-y-2">
          {flags.map((f, i) => (
            <li key={i} className={clsx('rounded-lg border p-3 text-xs', flagColors[f.severity])}>
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <span className="uppercase tracking-wide opacity-70">{f.severity}</span>
                <span>—</span>
                <span>{f.type.replace(/_/g, ' ')}</span>
              </div>
              {f.text && <p className="italic opacity-80 mb-1">"{f.text.slice(0, 120)}"</p>}
              <p>{f.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import clsx from 'clsx'

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-lg bg-slate-800 relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-slate-700/40 before:to-transparent',
        'before:animate-[shimmer_1.6s_infinite]',
        className
      )}
    />
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-start gap-4">
          <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-7 w-12" />
            <Shimmer className="h-2.5 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-start gap-4">
          <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2.5">
            <div className="flex gap-2">
              <Shimmer className="h-4 w-16 rounded-full" />
              <Shimmer className="h-4 w-20 rounded-full" />
            </div>
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
          <Shimmer className="h-8 w-24 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex gap-8">
        {['w-24', 'w-20', 'w-32', 'w-20'].map((w, i) => (
          <Shimmer key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-slate-800/50 flex gap-8 items-center">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-5 w-20 rounded-full" />
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="h-1 bg-slate-800" />
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <Shimmer className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-48" />
                <Shimmer className="h-3 w-40" />
              </div>
            </div>
            <Shimmer className="h-9 rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, j) => (
                <Shimmer key={j} className="w-8 h-8 rounded-full" />
              ))}
            </div>
            <Shimmer className="h-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

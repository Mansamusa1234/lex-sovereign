import { Loader2, Scale } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6 text-slate-950" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Lex Sovereign] Unhandled error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-white text-xl font-semibold">Something went wrong</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            {error.message || 'An unexpected error occurred. Check your API keys and Supabase connection.'}
          </p>
          {error.digest && (
            <p className="text-slate-700 text-xs mt-2 font-mono">digest: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  )
}

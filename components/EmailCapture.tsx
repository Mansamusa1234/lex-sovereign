'use client'
import { useState } from 'react'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  source?: string
  placeholder?: string
  buttonText?: string
  compact?: boolean
}

export default function EmailCapture({
  source = 'landing_page',
  placeholder = 'Enter your email address',
  buttonText = 'Get Free Access',
  compact = false,
}: Props) {
  const [email, setEmail]   = useState('')
  const [name,  setName]    = useState('')
  const [state, setState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg,   setMsg]     = useState('')

  async function subscribe() {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setMsg('Please enter a valid email address')
      setState('error')
      return
    }
    setState('loading')
    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setState('done')
      setMsg(data.message ?? 'Subscribed!')
    } catch (err) {
      setState('error')
      setMsg((err as Error).message)
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <p className="font-semibold text-sm">{msg} Check your inbox for a welcome email.</p>
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {!compact && (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your first name (optional)"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 backdrop-blur-sm"
        />
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            onKeyDown={e => e.key === 'Enter' && subscribe()}
            placeholder={placeholder}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 backdrop-blur-sm"
          />
        </div>
        <button
          onClick={subscribe}
          disabled={state === 'loading'}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-amber-500/30 flex-shrink-0 flex items-center gap-2"
        >
          {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {state === 'loading' ? '...' : buttonText}
        </button>
      </div>
      {state === 'error' && msg && (
        <p className="text-red-400 text-xs">{msg}</p>
      )}
      <p className="text-slate-600 text-xs">Free to join · No spam · Unsubscribe anytime</p>
    </div>
  )
}

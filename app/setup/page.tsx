'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import {
  CheckCircle, XCircle, Loader2, BookOpen,
  ExternalLink, RefreshCw, Zap, AlertTriangle,
  DollarSign, Key
} from 'lucide-react'
import clsx from 'clsx'

interface HealthResult {
  status: string
  supabase: boolean
  agents: number
  openai_key: boolean
  openai_working: boolean
  openai_error: string | null
  gmail: boolean
  latency_ms: number
}

export default function SetupPage() {
  const [health, setHealth]       = useState<HealthResult | null>(null)
  const [loading, setLoading]     = useState(true)
  const [seeding, setSeeding]     = useState(false)
  const [seedResult, setSeedResult] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  async function check() {
    setLoading(true)
    try {
      const [h, s] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
      ])
      setHealth(h)
      setPendingCount(s.pending_approvals ?? 0)
    } catch { setHealth(null) }
    setLoading(false)
  }

  useEffect(() => { check() }, [])

  async function seedKnowledge() {
    setSeeding(true)
    setSeedResult('')
    try {
      const res = await fetch('/api/knowledge/seed', { method: 'POST' })
      const data = await res.json()
      setSeedResult(data.message ?? 'Done')
      await check()
    } catch { setSeedResult('Seed failed — check OpenAI API key and billing first.') }
    finally { setSeeding(false) }
  }

  const isReady = health?.supabase && health?.openai_working

  return (
    <div className="flex min-h-screen">
      <div className="ambient-glow" aria-hidden />
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-400/60 text-xs font-mono tracking-widest uppercase mb-1">System</p>
              <h1 className="text-2xl font-black text-white">Setup & Status</h1>
              <p className="text-slate-400 text-sm mt-1">Check your configuration and fix any issues.</p>
            </div>
            <button onClick={check} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors disabled:opacity-50">
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
              Recheck
            </button>
          </div>

          {/* Status banner */}
          <div className={clsx(
            'rounded-xl border p-5',
            loading ? 'border-slate-800 bg-slate-900'
            : isReady ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-red-500/30 bg-red-500/5'
          )}>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking system status…
              </div>
            ) : isReady ? (
              <div>
                <p className="text-emerald-300 font-bold">System is healthy — agents are ready</p>
                <p className="text-emerald-400/70 text-sm mt-1">
                  {health.agents} agent{health.agents !== 1 ? 's' : ''} active · Latency {health.latency_ms}ms
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-300 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Setup incomplete — agents cannot respond
                </p>
                <p className="text-red-400/70 text-sm mt-1">Fix the issues below to enable the AI.</p>
              </div>
            )}
          </div>

          {/* OpenAI Status — most important */}
          {health && !health.openai_working && (
            <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-300 font-bold text-lg">OpenAI Not Working — This Is Why Agents Fail</p>
                  {health.openai_error && (
                    <p className="text-red-400 text-sm mt-1 font-mono bg-red-500/10 px-3 py-2 rounded-lg mt-2">
                      {health.openai_error}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 hover:border-amber-500/30 rounded-xl transition-colors">
                  <Key className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Check API Key</p>
                    <p className="text-slate-500 text-xs">platform.openai.com/api-keys</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 ml-auto" />
                </a>
                <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 hover:border-emerald-500/30 rounded-xl transition-colors">
                  <DollarSign className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Add Billing Credit</p>
                    <p className="text-slate-500 text-xs">Min $5 — needed to use the API</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 ml-auto" />
                </a>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-white font-semibold text-sm mb-2">After adding billing:</p>
                <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                  <li>Go to <strong className="text-white">Vercel</strong> → your project → <strong className="text-white">Settings</strong> → <strong className="text-white">Environment Variables</strong></li>
                  <li>Find <code className="text-amber-400 text-xs bg-slate-800 px-1 rounded">OPENAI_API_KEY</code> and make sure it's correct</li>
                  <li>Go to <strong className="text-white">Deployments</strong> → click <strong className="text-white">Redeploy</strong></li>
                  <li>Come back here and click <strong className="text-white">Recheck</strong></li>
                </ol>
              </div>
            </div>
          )}

          {/* All checks */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-white font-semibold">System Checks</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                { label: 'Supabase Database', ok: health?.supabase, detail: health?.supabase ? `${health.agents} agents registered` : 'Not connected' },
                { label: 'OpenAI API Key', ok: health?.openai_key, detail: health?.openai_key ? 'Key present' : 'OPENAI_API_KEY missing in Vercel' },
                { label: 'OpenAI API Working', ok: health?.openai_working, detail: health?.openai_error ?? (health?.openai_working ? 'Connected' : 'Not tested') },
                { label: 'Gmail Integration', ok: health?.gmail, detail: health?.gmail ? 'Configured' : 'Optional — emails still work manually' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 px-5 py-4">
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-slate-600 animate-spin flex-shrink-0" />
                  ) : item.ok ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={clsx('font-medium text-sm', loading ? 'text-slate-500' : item.ok ? 'text-white' : 'text-red-300')}>
                      {item.label}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge base seed */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h2 className="text-white font-bold">Seed Law Library</h2>
                </div>
                <p className="text-slate-400 text-sm">
                  Load 30+ real laws: UCC 1-308, FDCPA, FCRA, Constitutional rights, procedural law, common law definitions, and letter templates.
                  Requires OpenAI to generate searchable embeddings.
                </p>
                {seedResult && (
                  <p className={clsx('text-sm mt-2', seedResult.includes('failed') ? 'text-red-400' : 'text-emerald-400')}>
                    {seedResult}
                  </p>
                )}
              </div>
              <button onClick={seedKnowledge} disabled={seeding || !health?.openai_working}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-sm transition-colors flex-shrink-0">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                {seeding ? 'Loading…' : 'Seed Library'}
              </button>
            </div>
          </div>

          {/* Gmail connect */}
          <div className="bg-slate-900 rounded-xl border border-amber-500/20 p-5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">5</div>
              <div className="flex-1">
                <p className="text-white font-semibold">Connect Gmail (Optional)</p>
                <p className="text-slate-400 text-sm mt-0.5">Allows Aria to read your inbox and draft replies to critical emails.</p>
                <a href="/api/auth/gmail"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                  Connect Gmail
                </a>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/dashboard', label: 'Ask the AI Brain', desc: 'Chat with Sovereign, Lex & Aria' },
              { href: '/emails',    label: 'Emails',           desc: 'Sync Gmail or add manually' },
              { href: '/knowledge', label: 'Law Library',       desc: 'Browse 30+ statutes' },
              { href: '/agents',    label: 'Agent Settings',    desc: 'Set language & colour' },
              { href: '/documents', label: 'Documents',         desc: 'Upload PDFs & DOCX files' },
              { href: '/audit',     label: 'Audit Log',         desc: 'Every AI action recorded' },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="flex items-start gap-3 p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors">
                <div>
                  <p className="text-white text-sm font-semibold">{link.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}

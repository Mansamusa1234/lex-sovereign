'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { CheckCircle, XCircle, Loader2, BookOpen, ExternalLink, RefreshCw, Zap } from 'lucide-react'
import clsx from 'clsx'

interface CheckResult {
  supabase: boolean
  openai: boolean
  gmail_oauth: boolean
  gmail_sync: boolean
  knowledge_count: number
  agent_count: number
}

const STEPS = [
  {
    id: 'supabase',
    title: 'Supabase Database',
    description: 'Your database and auth provider. Required for everything.',
    link: 'https://supabase.com',
    linkLabel: 'Create project',
    env: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  {
    id: 'openai',
    title: 'OpenAI API',
    description: 'Powers all three agents and the vector memory search.',
    link: 'https://platform.openai.com/api-keys',
    linkLabel: 'Get API key',
    env: ['OPENAI_API_KEY'],
  },
  {
    id: 'gmail_oauth',
    title: 'Gmail OAuth (credentials)',
    description: 'Allows the app to read your inbox. Set up in Google Cloud Console.',
    link: 'https://console.cloud.google.com',
    linkLabel: 'Google Cloud Console',
    env: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET'],
  },
  {
    id: 'gmail_sync',
    title: 'Gmail Refresh Token',
    description: 'Complete the OAuth flow to get your refresh token.',
    env: ['GMAIL_REFRESH_TOKEN'],
  },
]

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={clsx(
      'flex items-center gap-1.5 text-xs font-semibold',
      ok ? 'text-emerald-400' : 'text-red-400'
    )}>
      {ok
        ? <CheckCircle className="w-4 h-4" />
        : <XCircle className="w-4 h-4" />}
      {ok ? 'Connected' : 'Not configured'}
    </span>
  )
}

export default function SetupPage() {
  const [status, setStatus] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState('')

  async function check() {
    setLoading(true)
    try {
      const [statsRes, agentsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.ok ? r.json() : null),
        fetch('/api/audit?limit=1').then(r => r.ok ? r.json() : null),
      ])
      const kbRes = await fetch('/api/knowledge?limit=1').then(r => r.ok ? r.json() : null)

      setStatus({
        supabase: !!statsRes && statsRes.active_agents !== undefined,
        openai: true, // assume ok if Supabase is up (tested on first AI call)
        gmail_oauth: false, // cannot check env vars from client — user must verify
        gmail_sync: false,
        knowledge_count: kbRes?.knowledge?.length ?? 0,
        agent_count: statsRes?.active_agents ?? 0,
      })
    } catch {
      setStatus(null)
    }
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
    } catch (err) {
      setSeedResult('Seed failed — make sure your OpenAI API key is configured.')
    } finally {
      setSeeding(false)
    }
  }

  const allGood = status?.supabase && status?.openai && status?.agent_count > 0

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Setup & Status</h1>
              <p className="text-slate-400 text-sm mt-1">Check your configuration and complete first-time setup.</p>
            </div>
            <button onClick={check} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm transition-colors disabled:opacity-50">
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
              Recheck
            </button>
          </div>

          {/* Overall status */}
          <div className={clsx(
            'rounded-xl border p-5',
            loading ? 'border-slate-800 bg-slate-900'
            : allGood ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
          )}>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking configuration…
              </div>
            ) : allGood ? (
              <div>
                <p className="text-emerald-300 font-semibold">System is running</p>
                <p className="text-emerald-400/70 text-sm mt-1">
                  {status!.agent_count} agent{status!.agent_count !== 1 ? 's' : ''} active.{' '}
                  {status!.knowledge_count > 0
                    ? `${status!.knowledge_count} knowledge entry/entries loaded.`
                    : 'No knowledge entries yet — seed the knowledge base below.'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-amber-300 font-semibold">Setup incomplete</p>
                <p className="text-amber-400/70 text-sm mt-1">Follow the steps below to finish configuration.</p>
              </div>
            )}
          </div>

          {/* Setup steps */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold">Configuration Checklist</h2>

            {STEPS.map((step, i) => (
              <div key={step.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{step.title}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{step.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.env.map(e => (
                          <code key={e} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                            {e}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                  {step.link && (
                    <a href={step.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                      {step.linkLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Gmail OAuth flow */}
            <div className="bg-slate-900 rounded-xl border border-amber-500/20 p-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-400">5</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Complete Gmail OAuth Flow</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    After setting <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">GMAIL_CLIENT_ID</code> and <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">GMAIL_CLIENT_SECRET</code>, click the button below to authorize Gmail access and get your refresh token.
                  </p>
                  <a href="/api/auth/gmail"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    Connect Gmail
                  </a>
                  <p className="text-slate-500 text-xs mt-2">
                    You will be redirected to Google. After authorizing, your refresh token will be displayed — copy it into your .env.local as <code>GMAIL_REFRESH_TOKEN</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seed knowledge base */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h2 className="text-white font-semibold">Seed Starter Knowledge</h2>
                </div>
                <p className="text-slate-400 text-sm">
                  Pre-load 12 essential legal entries including FDCPA rights, FCRA rights, Black's Law definitions, and letter templates.
                  Requires OpenAI to be configured (generates vector embeddings).
                </p>
                {seedResult && (
                  <p className="text-emerald-400 text-sm mt-2">{seedResult}</p>
                )}
              </div>
              <button onClick={seedKnowledge} disabled={seeding}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm transition-colors flex-shrink-0">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                {seeding ? 'Seeding…' : 'Seed Knowledge Base'}
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h2 className="text-white font-semibold mb-4">Quick Links</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/dashboard', label: 'Dashboard', desc: 'Ask the AI brain a question' },
                { href: '/emails', label: 'Emails', desc: 'Sync Gmail and draft replies' },
                { href: '/knowledge', label: 'Knowledge Base', desc: 'Add statutes, definitions, templates' },
                { href: '/documents', label: 'Documents', desc: 'Upload PDFs and DOCX files' },
                { href: '/approvals', label: 'Approval Queue', desc: 'Review AI-drafted replies' },
                { href: '/audit', label: 'Audit Log', desc: 'See every AI action recorded' },
              ].map(link => (
                <a key={link.href} href={link.href}
                  className="flex items-start gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{link.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

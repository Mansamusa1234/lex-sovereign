'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import AgentAvatar, { PERSONAS } from '@/components/AgentAvatar'
import { Loader2, CheckCircle, Languages, Palette, Clock, Activity, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { AGENT_LANGUAGES, AGENT_COLORS } from '@/lib/types'
import type { Agent } from '@/lib/types'

const TYPE_TO_PERSONA: Record<string, 'sovereign' | 'lex' | 'aria'> = {
  orchestrator:   'sovereign',
  legal_research: 'lex',
  email_drafting: 'aria',
}

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', pt: '🇧🇷',
  it: '🇮🇹', nl: '🇳🇱', pl: '🇵🇱', ru: '🇷🇺', zh: '🇨🇳',
  ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳', tr: '🇹🇷',
  sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮', he: '🇮🇱',
  ro: '🇷🇴', uk: '🇺🇦', id: '🇮🇩', ms: '🇲🇾', th: '🇹🇭', vi: '🇻🇳',
}

function AgentCard({ agent, onSave }: {
  agent: Agent
  onSave: (id: string, language: string, color: string) => Promise<void>
}) {
  const persona = TYPE_TO_PERSONA[agent.type] ?? 'sovereign'
  const p = PERSONAS[persona]
  const colorMeta = AGENT_COLORS[agent.color ?? 'amber'] ?? AGENT_COLORS.amber

  const [language, setLanguage] = useState(agent.language ?? 'en')
  const [color,    setColor]    = useState(agent.color ?? 'amber')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const isDirty = language !== (agent.language ?? 'en') || color !== (agent.color ?? 'amber')

  async function save() {
    setSaving(true)
    try {
      await onSave(agent.id, language, color)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const flag = LANGUAGE_FLAGS[language] ?? '🌐'
  const langName = AGENT_LANGUAGES[language] ?? language

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-500">
      {/* Color accent bar */}
      <div className={clsx('h-1.5', colorMeta.dot)} />

      {/* Agent identity header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-5">
          {/* Large human avatar */}
          <div className="relative flex-shrink-0">
            <AgentAvatar persona={persona} size={88} />
            {/* Status dot */}
            <div className={clsx(
              'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-slate-900',
              agent.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={clsx('text-xl font-black tracking-wide', p.accent)}>{p.name}</h3>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                agent.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              )}>
                {agent.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{p.fullName}</p>
            <p className="text-slate-600 text-xs mt-0.5 italic">"{p.tagline}"</p>
            <p className="text-slate-500 text-xs mt-1.5">{p.role}</p>
            {agent.last_active && (
              <p className="text-slate-700 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active {formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* Current language badge — prominent */}
        <div className={clsx(
          'mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border',
          colorMeta.badge
        )}>
          <span className="text-2xl">{flag}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Speaking Language</p>
            <p className="text-white font-bold text-lg">{langName}</p>
          </div>
          <Globe className="w-5 h-5 ml-auto opacity-40" />
        </div>
      </div>

      {/* Language selector */}
      <div className="px-6 pb-4">
        <label className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
          <Languages className="w-3.5 h-3.5" />
          Change Language
        </label>
        <div className="relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
          >
            <span className="text-xl">{flag}</span>
            <span className="flex-1 text-left font-medium">{langName}</span>
            <span className="text-slate-500 text-xs">{language}</span>
          </button>

          {langOpen && (
            <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {Object.entries(AGENT_LANGUAGES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code); setLangOpen(false) }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                      language === code
                        ? `${colorMeta.badge} font-semibold`
                        : 'text-slate-300 hover:bg-slate-700'
                    )}
                  >
                    <span className="text-lg">{LANGUAGE_FLAGS[code] ?? '🌐'}</span>
                    <span className="flex-1">{name}</span>
                    <span className="text-slate-500 text-xs font-mono">{code}</span>
                    {language === code && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {language !== 'en' && (
          <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: p.color }}>
            <Globe className="w-3 h-3" />
            {p.name} will respond entirely in {langName}
          </p>
        )}
      </div>

      {/* Color picker */}
      <div className="px-6 pb-4">
        <label className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2.5">
          <Palette className="w-3.5 h-3.5" />
          Accent Colour
          <span className="text-slate-600 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AGENT_COLORS).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setColor(key)}
              title={meta.label}
              className={clsx(
                'w-8 h-8 rounded-full transition-all duration-200',
                meta.dot,
                color === key
                  ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-125 ' + meta.ring
                  : 'opacity-50 hover:opacity-90 hover:scale-110'
              )}
            />
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="px-6 pb-6">
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300',
            saved
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : isDirty
              ? `${colorMeta.badge} border hover:shadow-lg hover:scale-[1.01]`
              : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
           saved   ? <CheckCircle className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : isDirty ? 'Save Settings' : 'No changes'}
        </button>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents,  setAgents]  = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ]).then(([agentsData, stats]) => {
      setAgents(agentsData.agents ?? [])
      setPendingCount(stats.pending_approvals ?? 0)
      setLoading(false)
    })
  }, [])

  async function handleSave(id: string, language: string, color: string) {
    const res = await fetch('/api/agents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, language, color }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    setAgents(prev => prev.map(a => a.id === id ? { ...a, language, color } : a))
  }

  return (
    <div className="flex min-h-screen">
      <div className="ambient-glow" aria-hidden />
      <div className="legal-grid" aria-hidden />
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8 space-y-8">

          {/* Header */}
          <div>
            <p className="text-amber-400/60 text-xs font-mono tracking-[0.3em] uppercase mb-2">Your AI Team</p>
            <h1 className="text-3xl font-black text-white">Meet Your Agents</h1>
            <p className="text-slate-400 text-sm mt-1">
              Three AI agents with distinct personalities, voices, and language settings. Each speaks directly to you in your chosen language.
            </p>
          </div>

          {/* Language tip */}
          <div className="bg-slate-900/60 rounded-xl border border-amber-500/20 p-5 flex items-start gap-4 backdrop-blur-sm">
            <Globe className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-bold">26 Languages — Each Agent Independent</p>
              <p className="text-slate-400 text-sm mt-1">
                Set Sovereign (the Orchestrator) to English for commands, Lex to French for research, and Aria to Spanish for email drafts.
                Or set all three to the same language. Changes take effect on the next request.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['🇬🇧 English', '🇪🇸 Spanish', '🇫🇷 French', '🇩🇪 German', '🇵🇱 Polish', '🇸🇦 Arabic', '🇨🇳 Mandarin', '🇷🇺 Russian'].map(l => (
                  <span key={l} className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">{l}</span>
                ))}
                <span className="text-xs bg-slate-800 text-amber-400/60 px-2.5 py-1 rounded-full border border-slate-700">+18 more</span>
              </div>
            </div>
          </div>

          {/* Agent cards */}
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onSave={handleSave} />
              ))}
            </div>
          )}

          {/* Expandable slots */}
          <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8 text-center backdrop-blur-sm">
            <p className="text-3xl mb-3">🤖</p>
            <p className="text-slate-400 font-semibold">27 Agent Slots Remaining</p>
            <p className="text-slate-600 text-sm mt-2">
              Future agents — tax law, immigration, employment, housing — will appear here with their own language and colour settings.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import {
  Bot, Loader2, CheckCircle, Languages, Palette,
  Activity, Clock, ChevronDown, Cpu, Mail, Scale
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { AGENT_LANGUAGES, AGENT_COLORS } from '@/lib/types'
import type { Agent } from '@/lib/types'

const TYPE_ICONS: Record<string, React.ElementType> = {
  orchestrator:   Scale,
  legal_research: Cpu,
  email_drafting: Mail,
  custom:         Bot,
}

const TYPE_LABELS: Record<string, string> = {
  orchestrator:   'Supreme Orchestrator',
  legal_research: 'Legal Research Agent',
  email_drafting: 'Email Drafting Agent',
  custom:         'Custom Agent',
}

const TYPE_DESC: Record<string, string> = {
  orchestrator:   'Receives all requests, decides which agents to call, and assembles the final response.',
  legal_research: 'Searches the knowledge base and uploaded documents using AI similarity search.',
  email_drafting: 'Reads and classifies emails, then generates draft replies for human approval.',
  custom:         'User-defined agent.',
}

function AgentCard({ agent, onSave }: {
  agent: Agent
  onSave: (id: string, language: string, color: string) => Promise<void>
}) {
  const [language, setLanguage] = useState(agent.language ?? 'en')
  const [color, setColor] = useState(agent.color ?? 'amber')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const colorMeta = AGENT_COLORS[color] ?? AGENT_COLORS.amber
  const Icon = TYPE_ICONS[agent.type] ?? Bot

  const isDirty = language !== (agent.language ?? 'en') || color !== (agent.color ?? 'amber')

  async function save() {
    setSaving(true)
    try {
      await onSave(agent.id, language, color)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={clsx(
      'bg-slate-900 rounded-2xl border overflow-hidden transition-colors',
      colorMeta.ring.replace('ring-', 'border-').replace('ring', 'border') + '/30',
      'border-slate-800'
    )}>
      {/* Color bar */}
      <div className={clsx('h-1', colorMeta.dot)} />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            colorMeta.badge
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-semibold">{agent.name}</p>
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                agent.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              )}>
                <span className={clsx(
                  'inline-block w-1.5 h-1.5 rounded-full mr-1.5',
                  agent.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                )} />
                {agent.status}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{TYPE_DESC[agent.type]}</p>
            {agent.last_active && (
              <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last active {formatDistanceToNow(new Date(agent.last_active), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* ── Language selector ─────────────────────── */}
        <div>
          <label className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
            <Languages className="w-3.5 h-3.5" />
            Response Language
          </label>
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
            >
              <span>
                {AGENT_LANGUAGES[language] ?? language}
                <span className="text-slate-500 ml-2 text-xs">{language}</span>
              </span>
              <ChevronDown className={clsx('w-4 h-4 text-slate-500 transition-transform', langOpen && 'rotate-180')} />
            </button>

            {langOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  {Object.entries(AGENT_LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); setLangOpen(false) }}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors',
                        language === code
                          ? colorMeta.badge + ' font-medium'
                          : 'text-slate-300 hover:bg-slate-700'
                      )}
                    >
                      <span>{name}</span>
                      <span className="text-slate-500 text-xs">{code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {language !== 'en' && (
            <p className="text-xs text-amber-400/80 mt-1.5">
              This agent will respond entirely in {AGENT_LANGUAGES[language]}. Statutes and citations remain in their original language.
            </p>
          )}
        </div>

        {/* ── Color picker ──────────────────────────── */}
        <div>
          <label className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
            <Palette className="w-3.5 h-3.5" />
            Accent Color <span className="text-slate-600 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AGENT_COLORS).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setColor(key)}
                title={meta.label}
                className={clsx(
                  'w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center',
                  meta.dot,
                  color === key
                    ? 'ring-2 ring-offset-2 ring-offset-slate-900 ' + meta.ring + ' scale-110'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                )}
              >
                {color === key && <CheckCircle className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-1.5">
            Selected: <span className="text-slate-400">{AGENT_COLORS[color]?.label ?? color}</span>
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            saved
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : isDirty
              ? `${colorMeta.badge} border hover:opacity-90`
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          )}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          {saving ? 'Saving…' : saved ? 'Saved!' : isDirty ? 'Save Changes' : 'No changes'}
        </button>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
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
    // Update local state
    setAgents(prev => prev.map(a => a.id === id ? { ...a, language, color } : a))
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

          <div>
            <h1 className="text-2xl font-bold text-white">Agent Settings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure the language and color for each AI agent. Changes take effect on the next request.
            </p>
          </div>

          {/* Language note */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-start gap-3">
            <Languages className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium text-sm">How language settings work</p>
              <p className="text-slate-400 text-sm mt-1">
                Each agent can respond in a different language. The Orchestrator controls the final summary language.
                The Legal Research and Email Drafting agents can be set to different languages — for example, if you want
                research in English but drafts in Spanish, set them independently.
                Legal citations and statutes are always preserved in their original form.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onSave={handleSave} />
              ))}
            </div>
          )}

          {/* Coming soon — future agents */}
          <div className="bg-slate-900/50 rounded-xl border border-dashed border-slate-800 p-6 text-center">
            <Bot className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 font-medium">27 agent slots remaining</p>
            <p className="text-slate-700 text-sm mt-1">
              Future agents will appear here with their own language and color settings.
              Add new agents via SQL: <code className="text-slate-600">INSERT INTO agents (name, type) VALUES ('My Agent', 'custom')</code>
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}

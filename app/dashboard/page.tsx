'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import StatsCard from '@/components/StatsCard'
import AgentActivity from '@/components/AgentActivity'
import ApprovalCard from '@/components/ApprovalCard'
import AgentPipeline, { type PipelineStates, type PipelineState } from '@/components/AgentPipeline'
import AgentAvatar, { PERSONAS } from '@/components/AgentAvatar'
import VoiceControls, { useSpeech } from '@/components/VoiceControls'
import { StatsSkeleton, ListSkeleton } from '@/components/Skeleton'
import { useToast } from '@/components/ToastProvider'
import {
  CheckSquare, BookOpen, FileText, Users, Send,
  AlertCircle, Sparkles, ChevronRight, Mic
} from 'lucide-react'
import MobileNav from '@/components/MobileNav'
import type { AuditEntry, Approval, RiskFlag } from '@/lib/types'
import clsx from 'clsx'

const IDLE_PIPELINE: PipelineStates = {
  orchestrator:   'idle',
  legal_research: 'idle',
  email_drafting: 'idle',
}

type StreamStatus = 'idle' | 'running' | 'done' | 'error'

export default function DashboardPage() {
  const { toast, success, error: toastError, warning } = useToast()
  const { speak, stop, speaking } = useSpeech()

  // Stats
  const [pending,   setPending]   = useState(0)
  const [knowledge, setKnowledge] = useState(0)
  const [docs,      setDocs]      = useState(0)
  const [agents,    setAgents]    = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // Activity + approvals
  const [auditEntries,     setAuditEntries]     = useState<AuditEntry[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([])
  const [activityLoading,  setActivityLoading]  = useState(true)

  // AI streaming
  const [query,          setQuery]          = useState('')
  const [streamStatus,   setStreamStatus]   = useState<StreamStatus>('idle')
  const [pipeline,       setPipeline]       = useState<PipelineStates>(IDLE_PIPELINE)
  const [statusMessages, setStatusMessages] = useState<string[]>([])
  const [streamedText,   setStreamedText]   = useState('')
  const [agentsUsed,     setAgentsUsed]     = useState<string[]>([])
  const [riskFlags,      setRiskFlags]      = useState<RiskFlag[]>([])
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [approvalId,     setApprovalId]     = useState<string>()
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)
  const responseRef = useRef<HTMLDivElement>(null)

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error()
      const d = await res.json()
      setPending(d.pending_approvals ?? 0)
      setKnowledge(d.knowledge_entries ?? 0)
      setDocs(d.documents ?? 0)
      setAgents(d.active_agents ?? 0)
    } catch {
      // silent — stats are non-critical
    }
    setStatsLoading(false)
  }, [])

  const loadActivity = useCallback(async () => {
    try {
      const [auditRes, appRes] = await Promise.all([
        fetch('/api/audit?limit=12').then(r => r.json()),
        fetch('/api/approvals?status=pending&limit=3').then(r => r.json()),
      ])
      setAuditEntries(auditRes.logs ?? [])
      setPendingApprovals(appRes.approvals ?? [])
    } catch {}
    setActivityLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
    loadActivity()
  }, [loadStats, loadActivity])

  // Auto-scroll streamed response
  useEffect(() => {
    if (streamedText && responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [streamedText])

  function setPipelineAgent(agent: string, state: PipelineState) {
    const keyMap: Record<string, keyof PipelineStates> = {
      orchestrator:   'orchestrator',
      legal_research: 'legal_research',
      email_drafting: 'email_drafting',
    }
    const key = keyMap[agent]
    if (key) setPipeline(prev => ({ ...prev, [key]: state }))
  }

  async function askAI() {
    if (!query.trim() || streamStatus === 'running') return

    setStreamStatus('running')
    setStreamedText('')
    setStatusMessages([])
    setAgentsUsed([])
    setRiskFlags([])
    setRequiresApproval(false)
    setApprovalId(undefined)
    setPipeline({ orchestrator: 'running', legal_research: 'idle', email_drafting: 'idle' })

    try {
      const res = await fetch('/api/agents/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed to start')

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            handleEvent(event)
          } catch {}
        }
      }
    } catch (err) {
      setStreamStatus('error')
      setPipeline(prev => ({ ...prev, orchestrator: 'error' }))
      toastError((err as Error).message)
    }
  }

  function handleEvent(event: any) {
    switch (event.type) {
      case 'status':
        setStatusMessages(prev => [...prev, event.message])
        if (event.agent) {
          setPipelineAgent(event.agent, 'running')
          if (event.agent !== 'orchestrator') {
            setPipeline(prev => ({ ...prev, orchestrator: 'running' }))
          }
        }
        break

      case 'research_done':
        setPipelineAgent('legal_research', 'done')
        if (event.sources > 0) {
          setStatusMessages(prev => [
            ...prev,
            `Found ${event.sources} source${event.sources !== 1 ? 's' : ''} in knowledge base`,
          ])
        }
        break

      case 'draft_done':
        setPipelineAgent('email_drafting', 'done')
        setRequiresApproval(true)
        setApprovalId(event.approval_id)
        break

      case 'agent_error':
        setPipelineAgent(event.agent, 'error')
        warning(`${event.agent.replace('_', ' ')}: ${event.message}`)
        break

      case 'token':
        setStreamedText(prev => prev + event.content)
        break

      case 'done':
        setStreamStatus('done')
        setPipeline({
          orchestrator:   'done',
          legal_research: event.agents_used?.includes('Legal Research Agent') ? 'done' : 'skipped',
          email_drafting: event.agents_used?.includes('Email Drafting Agent') ? 'done' : 'skipped',
        })
        setAgentsUsed(event.agents_used ?? [])
        setRiskFlags(event.risk_flags ?? [])
        if (event.requires_approval) {
          setRequiresApproval(true)
          setApprovalId(event.approval_id)
          toast('Draft created and queued for your approval', 'warning')
          setPending(p => p + 1)
        } else {
          success('Response complete')
        }
        loadStats()
        loadActivity()
        break

      case 'token':
        setStreamedText(prev => prev + event.content)
        break

      case 'error':
        setStreamStatus('error')
        setPipeline(prev => ({
          ...prev,
          orchestrator: 'error',
        }))
        toastError(event.message || 'An error occurred')
        break
    }
  }

  function reset() {
    readerRef.current?.cancel()
    readerRef.current = null
    setStreamStatus('idle')
    setStreamedText('')
    setStatusMessages([])
    setPipeline(IDLE_PIPELINE)
  }

  const isRunning = streamStatus === 'running'

  return (
    <div className="flex min-h-screen relative">
      {/* Ambient love-motion glow */}
      <div className="ambient-glow" aria-hidden />
      <Sidebar pendingCount={pending} />
      <MobileNav pendingCount={pending} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-8 space-y-6 md:space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Lex Sovereign AI Brain</h1>
              <p className="text-slate-400 text-sm mt-1">Legal research and drafting assistant — not a lawyer</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/api/health" target="_blank" rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 border border-slate-800 rounded-lg">
                health
              </a>
              <a href="/setup"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                Setup
              </a>
            </div>
          </div>

          {/* Stats */}
          {statsLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Pending Approvals" value={pending} icon={CheckSquare} accent="red"
                sub={pending > 0 ? 'Requires your review' : 'All clear'} />
              <StatsCard title="Knowledge Entries" value={knowledge} icon={BookOpen} accent="amber" />
              <StatsCard title="Documents" value={docs} icon={FileText} accent="blue" />
              <StatsCard title="Active Agents" value={agents} icon={Users} accent="emerald"
                sub="Out of 3 deployed" />
            </div>
          )}

          {/* Agent trio showcase */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <p className="text-slate-500 text-xs text-center mb-5 uppercase tracking-widest">Your AI Team</p>
            <div className="flex justify-center gap-8">
              {(['sovereign', 'lex', 'aria'] as const).map(p => (
                <div key={p} className="flex flex-col items-center gap-2 animate-[float_4s_ease-in-out_infinite]"
                  style={{ animationDelay: p === 'lex' ? '1.3s' : p === 'aria' ? '2.6s' : '0s' }}>
                  <AgentAvatar persona={p} size={64} speaking={false} />
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">{PERSONAS[p].name}</p>
                    <p className="text-slate-500 text-xs">{PERSONAS[p].role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask the AI — streaming */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-semibold">Ask the AI Brain</h2>
              </div>
              <p className="text-slate-500 text-xs">
                Speak or type your question. Sovereign, Lex, and Aria respond in real-time.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !isRunning && askAI()}
                  placeholder="e.g. What are my rights when a debt collector contacts me?"
                  disabled={isRunning}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 transition-colors"
                />
                {isRunning ? (
                  <button
                    onClick={reset}
                    className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-colors text-sm flex-shrink-0"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={askAI}
                    disabled={!query.trim()}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Ask
                  </button>
                )}
              </div>

              {/* Agent pipeline visualization */}
              <AgentPipeline states={pipeline} messages={statusMessages} />

              {/* Streaming response */}
              {(streamedText || streamStatus === 'error') && (
                <div className="space-y-3">
                  {/* Agent tags + voice */}
                  {agentsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {agentsUsed.map(a => (
                        <span key={a} className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                          {a}
                        </span>
                      ))}
                      {riskFlags.length > 0 && (
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {riskFlags.length} risk flag{riskFlags.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {streamStatus === 'done' && streamedText && (
                        <VoiceControls text={streamedText} onTranscript={t => setQuery(t)} />
                      )}
                    </div>
                  )}

                  {/* Response text */}
                  <div
                    ref={responseRef}
                    className={clsx(
                      'bg-slate-950 rounded-xl border p-5 max-h-96 overflow-y-auto',
                      streamStatus === 'error' ? 'border-red-500/30' : 'border-slate-800'
                    )}
                  >
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {streamedText}
                      {isRunning && (
                        <span className="inline-block w-0.5 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                      )}
                    </pre>
                  </div>

                  {/* Approval CTA */}
                  {requiresApproval && approvalId && streamStatus === 'done' && (
                    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-amber-300 text-sm font-semibold">Draft queued for approval</p>
                        <p className="text-amber-400/70 text-xs mt-0.5">Review and approve before the reply is pushed to Gmail.</p>
                      </div>
                      <a
                        href={`/approvals/${approvalId}`}
                        className="flex items-center gap-1.5 text-xs bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors flex-shrink-0"
                      >
                        Review <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Two-column: activity + approvals */}
          <div className="grid lg:grid-cols-2 gap-6">
            {activityLoading ? (
              <>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
                  <ListSkeleton rows={4} />
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="h-4 w-36 bg-slate-800 rounded mb-4" />
                  <ListSkeleton rows={3} />
                </div>
              </>
            ) : (
              <>
                <AgentActivity entries={auditEntries} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold">Pending Approvals</h2>
                    <a href="/approvals" className="text-amber-400 text-xs hover:text-amber-300 transition-colors flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                  {pendingApprovals.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
                      <CheckSquare className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No pending approvals</p>
                      <p className="text-slate-600 text-xs mt-1">Analyse an email to generate a draft</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingApprovals.map(a => <ApprovalCard key={a.id} approval={a} />)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

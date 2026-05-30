'use client'
import clsx from 'clsx'
import { Scale, Cpu, Mail, Check, X, Loader2, ChevronRight } from 'lucide-react'

export type PipelineState = 'idle' | 'running' | 'done' | 'error' | 'skipped'

export interface PipelineStates {
  orchestrator:   PipelineState
  legal_research: PipelineState
  email_drafting: PipelineState
}

interface AgentNode {
  key: keyof PipelineStates
  label: string
  sublabel: string
  icon: React.ElementType
}

const NODES: AgentNode[] = [
  { key: 'orchestrator',   label: 'Orchestrator',   sublabel: 'Routes & synthesises', icon: Scale },
  { key: 'legal_research', label: 'Legal Research', sublabel: 'Knowledge base search', icon: Cpu },
  { key: 'email_drafting', label: 'Email Drafting', sublabel: 'Draft & risk check',   icon: Mail },
]

const STATE_STYLE: Record<PipelineState, {
  ring: string; bg: string; text: string; dot: string
}> = {
  idle:    { ring: 'ring-slate-700',        bg: 'bg-slate-800',        text: 'text-slate-500',   dot: 'bg-slate-600' },
  running: { ring: 'ring-amber-500/60',     bg: 'bg-amber-500/10',     text: 'text-amber-300',   dot: 'bg-amber-400' },
  done:    { ring: 'ring-emerald-500/50',   bg: 'bg-emerald-500/10',   text: 'text-emerald-300', dot: 'bg-emerald-400' },
  error:   { ring: 'ring-red-500/50',       bg: 'bg-red-500/10',       text: 'text-red-300',     dot: 'bg-red-400' },
  skipped: { ring: 'ring-slate-700',        bg: 'bg-slate-800/50',     text: 'text-slate-600',   dot: 'bg-slate-700' },
}

function StateIcon({ state }: { state: PipelineState }) {
  if (state === 'done')    return <Check className="w-3.5 h-3.5 text-emerald-400" />
  if (state === 'error')   return <X className="w-3.5 h-3.5 text-red-400" />
  if (state === 'running') return <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
  return null
}

interface Props {
  states: PipelineStates
  messages?: string[]
}

export default function AgentPipeline({ states, messages = [] }: Props) {
  const anyActive = Object.values(states).some(s => s !== 'idle')
  if (!anyActive) return null

  return (
    <div className="space-y-3">
      {/* Pipeline nodes */}
      <div className="flex items-center gap-2">
        {NODES.map((node, i) => {
          const state = states[node.key]
          const style = STATE_STYLE[state]
          const Icon = node.icon

          return (
            <div key={node.key} className="flex items-center gap-2 flex-1 min-w-0">
              <div className={clsx(
                'flex-1 min-w-0 rounded-xl border ring-1 p-3 transition-all duration-300',
                style.bg, style.ring
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                    style.bg, 'border', style.ring.replace('ring-', 'border-')
                  )}>
                    <Icon className={clsx('w-3.5 h-3.5', style.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-xs font-semibold truncate', style.text)}>{node.label}</p>
                    <p className="text-slate-600 text-[10px] truncate">{node.sublabel}</p>
                  </div>
                  <StateIcon state={state} />
                  {state === 'running' && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', style.dot)} />
                  )}
                  {state === 'idle' && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', style.dot)} />
                  )}
                </div>
              </div>
              {i < NODES.length - 1 && (
                <ChevronRight className={clsx(
                  'w-4 h-4 flex-shrink-0 transition-colors duration-300',
                  state === 'done' ? 'text-emerald-400' : 'text-slate-700'
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Status messages */}
      {messages.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 font-mono">
          {messages.slice(-3).map((msg, i) => (
            <div key={i} className={clsx(
              'text-xs flex items-center gap-2 py-0.5',
              i === messages.length - 1 || (messages.length > 3 && i === 2)
                ? 'text-slate-300'
                : 'text-slate-600'
            )}>
              <span className="text-amber-600 select-none">›</span>
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

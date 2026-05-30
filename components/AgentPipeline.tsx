'use client'
import clsx from 'clsx'
import { Check, X, ChevronRight } from 'lucide-react'
import AgentAvatar, { PERSONAS, type AgentPersona } from './AgentAvatar'

export type PipelineState = 'idle' | 'running' | 'done' | 'error' | 'skipped'

export interface PipelineStates {
  orchestrator:   PipelineState
  legal_research: PipelineState
  email_drafting: PipelineState
}

const NODES: Array<{ key: keyof PipelineStates; persona: AgentPersona }> = [
  { key: 'orchestrator',   persona: 'sovereign' },
  { key: 'legal_research', persona: 'lex'       },
  { key: 'email_drafting', persona: 'aria'      },
]

const STATE_LABEL: Record<PipelineState, string> = {
  idle:    'Standby',
  running: 'Working…',
  done:    'Complete',
  error:   'Error',
  skipped: 'Skipped',
}

interface Props {
  states: PipelineStates
  messages?: string[]
}

export default function AgentPipeline({ states, messages = [] }: Props) {
  const anyActive = Object.values(states).some(s => s !== 'idle')
  if (!anyActive) return null

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      {/* Agent row */}
      <div className="flex items-center gap-2 justify-center">
        {NODES.map((node, i) => {
          const state   = states[node.key]
          const persona = PERSONAS[node.persona]
          const running = state === 'running'
          const done    = state === 'done'
          const error   = state === 'error'
          const idle    = state === 'idle' || state === 'skipped'

          return (
            <div key={node.key} className="flex items-center gap-2">
              <div className={clsx(
                'flex flex-col items-center gap-2 transition-all duration-500',
                running && 'scale-105',
                idle && 'opacity-40',
              )}>
                {/* Avatar */}
                <div className="relative">
                  <AgentAvatar
                    persona={node.persona}
                    size={56}
                    speaking={running}
                    active={running}
                  />
                  {/* State badge */}
                  {done && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {error && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Name + state */}
                <div className="text-center">
                  <p className="text-xs font-bold" style={{ color: idle ? '#64748b' : persona.color }}>
                    {persona.name}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {STATE_LABEL[state]}
                  </p>
                </div>
              </div>

              {i < NODES.length - 1 && (
                <ChevronRight className={clsx(
                  'w-4 h-4 flex-shrink-0 mb-5 transition-colors duration-500',
                  done ? 'text-emerald-400' : 'text-slate-700'
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Status log */}
      {messages.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 font-mono backdrop-blur-sm">
          {messages.slice(-3).map((msg, i) => {
            const isLatest = i === Math.min(messages.length - 1, 2)
            return (
              <div
                key={i}
                className={clsx(
                  'text-xs flex items-center gap-2 py-0.5 transition-opacity duration-500',
                  isLatest ? 'text-slate-300 opacity-100' : 'text-slate-600 opacity-60'
                )}
              >
                <span className="text-amber-600 select-none">›</span>
                {msg}
                {isLatest && (
                  <span className="inline-block w-1 h-3 bg-amber-400 ml-0.5 align-middle animate-[blinkCursor_1s_ease-in-out_infinite]" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

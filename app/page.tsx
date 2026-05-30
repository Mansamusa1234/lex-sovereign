'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NeuralBackground from '@/components/NeuralBackground'
import MorphingOrb from '@/components/MorphingOrb'
import LiveCounter from '@/components/LiveCounter'
import AgentAvatar, { PERSONAS } from '@/components/AgentAvatar'

interface PublicStats {
  knowledge_entries: number
  documents: number
  ai_actions: number
  active_agents: number
  days_running: number
  languages_supported: number
  today_insight: { headline?: string; insight?: string; action?: string } | null
}

const RIGHTS_TICKER = [
  'UCC 1-308 · WITHOUT PREJUDICE · ALL RIGHTS RESERVED',
  'FDCPA 15 U.S.C. § 1692 · DEBT VALIDATION RIGHTS',
  'FCRA 15 U.S.C. § 1681 · CREDIT DISPUTE RIGHTS',
  '5TH AMENDMENT · RIGHT TO REMAIN SILENT · DUE PROCESS',
  'HABEAS CORPUS · CHALLENGE UNLAWFUL DETENTION',
  'STARE DECISIS · PRECEDENT IN LAW',
  'CONSUMER RIGHTS ACT 2015 · 30-DAY RIGHT TO REJECT',
  'EQUALITY ACT 2010 · PROTECTED CHARACTERISTICS',
  'PACE ACT 1984 · POLICE DETENTION RIGHTS',
  'ARTICLE 6 ECHR · RIGHT TO FAIR TRIAL',
  'FOIA 2000 · RIGHT TO GOVERNMENT INFORMATION',
  'PRO SE RIGHTS 28 U.S.C. § 1654 · SELF-REPRESENTATION',
]

const LAW_AREAS = [
  { icon: '📜', title: 'UCC', sub: '1-308 · 1-103 · 3-104' },
  { icon: '⚖', title: 'Constitutional', sub: '1st · 4th · 5th · 14th' },
  { icon: '💰', title: 'FDCPA', sub: 'Debt Collector Defense' },
  { icon: '📊', title: 'FCRA', sub: 'Credit Report Rights' },
  { icon: '🚔', title: 'Police', sub: 'PACE · Stop & Search' },
  { icon: '🏛', title: 'Courts', sub: 'Small Claims · FRCP' },
  { icon: '🏢', title: 'Government', sub: 'HMRC · DWP · FOIA' },
  { icon: '💼', title: 'Employment', sub: 'ERA 1996 · Equality' },
  { icon: '🛒', title: 'Consumer', sub: 'CRA 2015 · S.75' },
  { icon: '🏠', title: 'Housing', sub: 'Tenants · Eviction' },
  { icon: '🌍', title: '26 Languages', sub: 'Global Access' },
  { icon: '🤖', title: '3 AI Agents', sub: 'Sovereign · Lex · Aria' },
]

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [tickerPos, setTickerPos] = useState(0)
  const [agentPulse, setAgentPulse] = useState(0)

  useEffect(() => {
    fetch('/api/stats/public').then(r => r.json()).then(setStats).catch(() => null)
  }, [])

  // Ticker animation
  useEffect(() => {
    const id = setInterval(() => {
      setTickerPos(p => (p + 1) % RIGHTS_TICKER.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  // Agent pulse cycle
  useEffect(() => {
    const id = setInterval(() => setAgentPulse(p => (p + 1) % 3), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Living backgrounds */}
      <NeuralBackground opacity={0.3} />
      <MorphingOrb color="#f59e0b" size={600} x="10%" y="15%" opacity={0.10} speed={6} />
      <MorphingOrb color="#7c3aed" size={500} x="85%" y="70%" opacity={0.08} speed={9} />
      <MorphingOrb color="#0ea5e9" size={400} x="70%" y="10%" opacity={0.06} speed={12} />
      <div className="legal-grid" aria-hidden />

      {/* Nav */}
      <nav className="relative z-10 border-b border-amber-500/10 px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border border-amber-500/40 seal-ring" />
              <div className="absolute inset-1 rounded-full bg-amber-500/15 flex items-center justify-center">
                <span className="text-amber-400 text-lg">⚖</span>
              </div>
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wider uppercase">Lex Sovereign</p>
              <p className="text-amber-400/50 text-[9px] tracking-[0.25em] uppercase font-mono">AI Brain · Growing Daily</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/news" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Legal News</Link>
            <Link href="/rights" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Know Your Rights</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">Plans</Link>
            <Link href="/dashboard" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105">
              ENTER →
            </Link>
          </div>
        </div>
      </nav>

      {/* Live stats bar */}
      {stats && (
        <div className="relative z-10 border-b border-amber-500/10 bg-amber-500/3 py-2.5 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-center">
            {[
              { label: 'Laws in Library', value: stats.knowledge_entries, suffix: '+' },
              { label: 'AI Actions Logged', value: stats.ai_actions, suffix: '' },
              { label: 'Languages', value: stats.languages_supported, suffix: '' },
              { label: 'Days Running', value: stats.days_running, suffix: '' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <LiveCounter
                  target={s.value}
                  suffix={s.suffix}
                  className="text-amber-400 font-black text-lg"
                />
                <span className="text-slate-600 text-xs">{s.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-mono">LIVE · Auto-updates weekly</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-16 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-400/70 text-xs font-mono tracking-widest mb-8 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            AI Grows · Law Updates Daily · Knowledge Base Expands Weekly
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none mb-4">
            <span className="gold-gradient">KNOW YOUR</span><br />
            <span className="text-white">RIGHTS.</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-black text-slate-500 mb-8">DRAFT YOUR RESPONSE.</h2>

          <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Three AI agents that research real law, draft professional responses, and grow smarter every week.
            FDCPA · FCRA · UCC · Constitutional Rights · Police Rights · Courts · Government Agencies.
          </p>
          <p className="text-xs text-slate-700 font-mono mb-10">
            All Rights Reserved · Without Prejudice · UCC 1-308 · Not a Law Firm · Not Legal Advice
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard"
              className="group px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xl transition-all hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 relative overflow-hidden">
              <span className="relative z-10">OPEN THE AI BRAIN →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link href="/rights"
              className="px-10 py-4 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/20 hover:border-amber-500/50 text-amber-400 font-black rounded-xl text-xl transition-all backdrop-blur-sm">
              KNOW YOUR RIGHTS
            </Link>
          </div>

          {/* Rights ticker */}
          <div className="relative overflow-hidden border-y border-amber-500/10 py-3 bg-amber-500/3">
            <div className="flex gap-16 whitespace-nowrap"
              style={{ animation: 'marquee 30s linear infinite' }}>
              {[...RIGHTS_TICKER, ...RIGHTS_TICKER].map((r, i) => (
                <span key={i} className="text-amber-500/40 text-xs font-mono tracking-widest">◆ {r}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Agents */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-600 text-xs font-mono tracking-[0.3em] uppercase text-center mb-8">Your AI Team · Always Active</p>
          <div className="flex justify-center gap-12">
            {(['sovereign', 'lex', 'aria'] as const).map((p, i) => (
              <div key={p} className="flex flex-col items-center gap-3">
                <div className="relative">
                  <AgentAvatar
                    persona={p}
                    size={80}
                    speaking={agentPulse === i}
                    active={agentPulse === i}
                  />
                  {/* Pulse ring when active */}
                  {agentPulse === i && (
                    <div className="absolute inset-0 rounded-full animate-[pulseRing_1s_ease-out_infinite]"
                      style={{ borderColor: PERSONAS[p].color, borderWidth: 2, borderStyle: 'solid' }} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-black text-base" style={{ color: PERSONAS[p].color }}>{PERSONAS[p].name}</p>
                  <p className="text-slate-600 text-xs">{PERSONAS[p].role}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${agentPulse === i ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                    <span className="text-slate-700 text-xs font-mono">{agentPulse === i ? 'active' : 'standby'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's insight */}
      {stats?.today_insight?.headline && (
        <section className="relative z-10 px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
              <p className="text-amber-400/60 text-xs font-mono tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Legal Insight of the Day — Auto-Generated
              </p>
              <p className="text-white font-black text-xl mb-2">{stats.today_insight.headline}</p>
              {stats.today_insight.insight && (
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{stats.today_insight.insight}</p>
              )}
              {stats.today_insight.action && (
                <p className="text-amber-400 text-sm">→ {stats.today_insight.action}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Law areas grid — animated */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600 text-xs font-mono tracking-[0.3em] uppercase text-center mb-4">Auto-Expanding Law Library</p>
          <h2 className="text-3xl font-black text-center text-white mb-2">
            {stats ? (
              <><LiveCounter target={stats.knowledge_entries} suffix="+" className="text-amber-400" /> Laws · Growing Every Week</>
            ) : (
              <>30+ Laws · Growing Every Week</>
            )}
          </h2>
          <p className="text-slate-500 text-center mb-12 text-sm">New statutes auto-added weekly by the AI. You never have to update anything.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {LAW_AREAS.map((area, i) => (
              <Link href="/knowledge" key={area.title}
                className="group bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 backdrop-blur-sm"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="text-3xl mb-3">{area.icon}</div>
                <p className="text-white font-black text-sm">{area.title}</p>
                <p className="text-amber-400/50 text-xs font-mono mt-0.5">{area.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UCC quote */}
      <section className="relative z-10 px-6 py-16 border-y border-amber-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block border border-amber-500/20 rounded-3xl px-10 py-10 bg-amber-500/3 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 holo-shimmer opacity-20 rounded-3xl" />
            <p className="text-amber-400/50 text-xs font-mono tracking-[0.3em] uppercase mb-6">Uniform Commercial Code · United States</p>
            <blockquote className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6 relative z-10">
              "A party that with explicit reservation of rights performs...
              does not thereby prejudice the rights reserved."
            </blockquote>
            <p className="text-amber-400 font-mono text-sm">UCC § 1-308 · All Rights Reserved · Without Prejudice</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center mx-auto mb-8 seal-ring">
            <span className="text-3xl">⚖</span>
          </div>
          <h2 className="text-5xl font-black mb-6 gold-gradient">ALL RIGHTS RESERVED.</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Without prejudice. UCC 1-308. Research your rights. Draft your response.
            The AI grows every week. The knowledge base expands automatically. You're always armed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"
              className="px-12 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xl transition-all hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105">
              OPEN FREE →
            </Link>
            <Link href="/pricing"
              className="px-12 py-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xl transition-all">
              SEE PLANS
            </Link>
          </div>
          <p className="text-slate-700 text-xs mt-8 font-mono">
            LEGAL RESEARCH TOOL ONLY · NOT A LAW FIRM · NOT LEGAL ADVICE
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-500/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">⚖</div>
            <span className="text-slate-600 text-xs font-mono">Lex Sovereign AI Brain · Grows Weekly · Not a Lawyer</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-slate-700 text-xs font-mono">
            {[
              ['/dashboard', 'BRAIN'],
              ['/rights', 'RIGHTS'],
              ['/news', 'NEWS'],
              ['/knowledge', 'LIBRARY'],
              ['/pricing', 'PLANS'],
              ['/brand', 'BRAND'],
              ['/audit', 'AUDIT'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-amber-400 transition-colors tracking-widest">{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

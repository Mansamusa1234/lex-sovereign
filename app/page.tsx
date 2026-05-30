import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lex Sovereign AI Brain — AI Legal Research & Drafting Assistant',
  description:
    'Fight debt collectors, understand your FDCPA and FCRA rights, and draft professional legal responses with AI. Not a lawyer — a powerful research and drafting tool for real people.',
}

const FEATURES = [
  { icon: '⚖', title: 'Legal Research Agent', desc: 'Searches statutes, case law, and Black\'s Law Dictionary entries from your own knowledge base.' },
  { icon: '✉', title: 'Email Drafting Agent', desc: 'Reads your Gmail, classifies critical letters, and drafts responses for debt collectors, courts, and government agencies.' },
  { icon: '🛡', title: 'Human Approval Required', desc: 'Nothing is ever sent automatically. Every draft is reviewed and approved by you first.' },
  { icon: '⚡', title: 'Real-Time AI Streaming', desc: 'Watch the AI think in real time — three coordinated agents working together on your behalf.' },
  { icon: '🌍', title: '26 Languages', desc: 'Each agent can respond in a different language. Set the research agent to English and drafts to Spanish, for example.' },
  { icon: '📋', title: 'Full Audit Trail', desc: 'Every AI action is logged. Know exactly what was researched, drafted, edited, and approved.' },
]

const USECASES = [
  'Responding to debt collector letters',
  'Sending FDCPA debt validation requests',
  'Disputing credit report errors under FCRA',
  'Drafting cease and desist letters',
  'Researching your consumer rights',
  'Understanding court notices and legal demands',
  'Organizing and searching legal documents',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg">⚖</div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Lex Sovereign</p>
              <p className="text-slate-400 text-xs">AI Brain</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
            <Link href="/dashboard" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-8">
            <span>⚖</span> Legal research and drafting assistant — not a lawyer
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Know Your Rights.<br/>
            <span className="text-amber-400">Draft Your Response.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered legal research for real people. Fight debt collectors, understand the FDCPA and FCRA,
            and draft professional responses — with human approval before anything is sent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-lg transition-colors">
              Start Researching Free
            </Link>
            <Link href="/knowledge" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-lg transition-colors border border-slate-700">
              Browse Knowledge Base
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-6">No credit card required · Free to start · Not a law firm</p>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-slate-800 py-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-center">
          {[
            ['FDCPA', 'Fair Debt Collection'],
            ['FCRA', 'Credit Report Rights'],
            ['UCC 1-308', 'Reservation of Rights'],
            ['5th Amendment', 'Constitutional Rights'],
            ['26 Languages', 'Global Access'],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="text-amber-400 font-bold text-lg">{title}</p>
              <p className="text-slate-500 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Three AI Agents Working Together</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            The Supreme Orchestrator coordinates the Legal Research Agent and Email Drafting Agent — all sharing one memory and knowledge base.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">What People Use It For</h2>
          <p className="text-slate-400 text-center mb-12">Real situations where knowing your rights matters.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {USECASES.map(u => (
              <div key={u} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-xs">✓</span>
                </div>
                <p className="text-slate-300 text-sm">{u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Know Your Rights?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Start for free. Add your own statutes, upload documents, connect your Gmail, and have AI research your legal situation in seconds.
          </p>
          <Link href="/dashboard" className="inline-block px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xl transition-colors">
            Open the AI Brain
          </Link>
          <p className="text-slate-600 text-sm mt-6">
            This is a legal research and drafting tool. It is not a law firm and does not provide legal advice. Always consult a qualified attorney for your specific legal situation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 text-sm">⚖</div>
            <span className="text-slate-400 text-sm">Lex Sovereign AI Brain — Legal Research Assistant, Not a Lawyer</span>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/knowledge" className="hover:text-white transition-colors">Knowledge Base</Link>
            <Link href="/setup" className="hover:text-white transition-colors">Setup</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

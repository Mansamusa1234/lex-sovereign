'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap, Shield, Building2, Star } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import clsx from 'clsx'

const PLAN_ICONS = { free: Shield, pro: Zap, business: Building2 }

export default function PricingPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function subscribe(plan: string) {
    if (plan === 'free') { window.location.href = '/dashboard'; return }
    setLoading(plan)
    try {
      const res  = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? 'Something went wrong')
    } catch { alert('Error — check Stripe is configured') }
    finally { setLoading(null) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="legal-grid" aria-hidden />
      <div className="ambient-glow" aria-hidden />

      {/* Nav */}
      <nav className="relative z-10 border-b border-amber-500/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">⚖</div>
            <span className="font-black text-white">Lex Sovereign</span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-mono tracking-widest uppercase mb-6">
              <Star className="w-3.5 h-3.5" /> 7-day free trial on all paid plans
            </div>
            <h1 className="text-5xl font-black text-white mb-4">
              Choose Your <span className="gold-gradient">AI Legal Plan</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Start free. Upgrade when you need unlimited AI, Gmail sync, voice features, and the full 30+ statute law library.
              Cancel anytime.
            </p>
          </div>

          {/* Email capture */}
          <div className="max-w-sm mx-auto mb-10">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com (optional)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-center"
            />
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
              const Icon = PLAN_ICONS[key as keyof typeof PLAN_ICONS]
              const isHighlight = 'highlight' in plan && plan.highlight
              return (
                <div key={key} className={clsx(
                  'rounded-2xl border overflow-hidden transition-all duration-300',
                  isHighlight
                    ? 'border-amber-500/50 shadow-2xl shadow-amber-500/20 scale-105'
                    : 'border-slate-800 hover:border-slate-700'
                )}>
                  {isHighlight && (
                    <div className="bg-amber-500 text-slate-950 text-center text-xs font-black py-2 tracking-widest uppercase">
                      Most Popular — 7-Day Free Trial
                    </div>
                  )}
                  <div className={clsx('p-6', isHighlight ? 'bg-amber-500/5' : 'bg-slate-900')}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isHighlight ? 'bg-amber-500/20' : 'bg-slate-800'
                      )}>
                        <Icon className={clsx('w-5 h-5', isHighlight ? 'text-amber-400' : 'text-slate-400')} />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg">{plan.name}</p>
                        <p className="text-slate-500 text-xs uppercase tracking-widest">{key}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className={clsx('text-5xl font-black', isHighlight ? 'text-amber-400' : 'text-white')}>
                        ${plan.price}
                      </span>
                      {plan.price > 0 && <span className="text-slate-500 text-sm">/month</span>}
                      {plan.price === 0 && <span className="text-slate-500 text-sm"> forever</span>}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f: string) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', isHighlight ? 'text-amber-400' : 'text-emerald-400')} />
                          <span className="text-slate-300">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => subscribe(key)}
                      disabled={loading === key}
                      className={clsx(
                        'w-full py-3 rounded-xl font-black text-sm transition-all',
                        isHighlight
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-lg hover:shadow-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      )}
                    >
                      {loading === key ? 'Loading…' :
                       key === 'free' ? 'Start Free' :
                       `Start 7-Day Trial`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust signals */}
          <div className="mt-16 text-center">
            <p className="text-slate-600 text-sm mb-6">Trusted payment processing by Stripe · Cancel anytime · No hidden fees</p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-600 text-xs">
              {['🔒 SSL Encrypted', '💳 Stripe Payments', '↩️ Cancel Anytime', '7-Day Trial on Pro & Business', '🌍 26 Languages'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-black text-white text-center mb-8">Common Questions</h2>
            {[
              ['Can I cancel anytime?', 'Yes. Cancel from your billing portal anytime. You keep access until the end of your billing period.'],
              ['Is there a free trial?', 'Yes — Pro and Business plans include a 7-day free trial. No card charged until the trial ends.'],
              ['Is this a law firm?', 'No. Lex Sovereign AI Brain is a legal research and drafting tool, not a law firm. Always consult a qualified attorney.'],
              ['What payment methods are accepted?', 'All major credit and debit cards via Stripe. Apple Pay and Google Pay also supported.'],
              ['Can I use it for my business?', 'The Business plan supports up to 10 team members and includes white-label options.'],
            ].map(([q, a]) => (
              <div key={q} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-white font-semibold text-sm mb-2">{q}</p>
                <p className="text-slate-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

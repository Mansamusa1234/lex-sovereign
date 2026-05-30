'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, CreditCard, MapPin, User, Mail, Lock, ChevronDown, AlertCircle } from 'lucide-react'
import { PLANS, type PlanKey } from '@/lib/stripe'
import HoloCard from '@/components/HoloCard'
import NeuralBackground from '@/components/NeuralBackground'
import clsx from 'clsx'

const PLAN_COLORS: Record<string, string> = {
  free: '#64748b', pro: '#f59e0b', business: '#a78bfa',
}

interface AddressResult {
  postcode: string; city: string; county: string; country: string; region: string
}

function SmartInput({
  label, icon: Icon, error, hint, ...props
}: {
  label: string
  icon?: React.ElementType
  error?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(false)

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className={clsx(
        'relative flex items-center rounded-xl border transition-all duration-300',
        focused
          ? 'border-amber-500/60 bg-slate-800/80 shadow-lg shadow-amber-500/10'
          : error && touched
          ? 'border-red-500/50 bg-red-500/5'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600',
      )}>
        {Icon && (
          <Icon className={clsx(
            'w-4 h-4 ml-3.5 flex-shrink-0 transition-colors',
            focused ? 'text-amber-400' : 'text-slate-600'
          )} />
        )}
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); setTouched(true); props.onBlur?.(e) }}
          className={clsx(
            'flex-1 px-3 py-3.5 bg-transparent text-sm text-white placeholder-slate-600',
            'focus:outline-none font-mono tracking-wide',
            Icon ? 'pl-2' : 'pl-4',
          )}
        />
        {/* Scan line on focus */}
        {focused && (
          <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
            <div className="absolute w-full h-px bg-amber-500/30" style={{ animation: 'scanLine 1.5s linear infinite' }} />
          </div>
        )}
      </div>
      {error && touched && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {hint && !error && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  )
}

function CheckoutInner() {
  const params = useSearchParams()
  const plan   = (params.get('plan') ?? 'pro') as PlanKey
  const selectedPlan = PLANS[plan] ?? PLANS.pro
  const color  = PLAN_COLORS[plan] ?? '#f59e0b'

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    line1: '', line2: '', city: '', county: '', postcode: '', country: 'United Kingdom',
  })
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [suggestions, setSuggestions] = useState<AddressResult | null>(null)
  const postcodeTimeout = useRef<ReturnType<typeof setTimeout>>()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Auto-lookup postcode
  useEffect(() => {
    const pc = form.postcode.replace(/\s/g, '')
    if (pc.length < 5) { setSuggestions(null); return }
    clearTimeout(postcodeTimeout.current)
    postcodeTimeout.current = setTimeout(async () => {
      setLookingUp(true)
      try {
        const res  = await fetch(`/api/address/lookup?postcode=${encodeURIComponent(pc)}`)
        const data = await res.json()
        if (!data.error) {
          setSuggestions(data)
        }
      } catch {} finally { setLookingUp(false) }
    }, 500)
  }, [form.postcode])

  function applyAddress(a: AddressResult) {
    setForm(f => ({ ...f, city: a.city, county: a.county, country: a.country, postcode: a.postcode }))
    setSuggestions(null)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Please enter a valid email address'
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim())  e.lastName  = 'Last name is required'
    if (!form.line1.trim())     e.line1     = 'Address line 1 is required'
    if (!form.city.trim())      e.city      = 'City/Town is required'
    if (!form.postcode.trim())  e.postcode  = 'Postcode/ZIP is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function proceed() {
    if (!validate()) return
    if (plan === 'free') { window.location.href = '/dashboard'; return }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: form.email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error)
    } catch { alert('Error — please try again') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      <NeuralBackground opacity={0.25} />
      <div className="legal-grid" aria-hidden />

      {/* Nav */}
      <nav className="relative z-10 border-b border-amber-500/10 px-6 py-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-lg animate-[breathe_3s_ease-in-out_infinite]">⚖</div>
            <span className="font-black text-white tracking-wide">Lex Sovereign</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            256-bit SSL · Powered by Stripe
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — Plan preview */}
          <div className="space-y-8">
            <div>
              <p className="text-amber-400/60 text-xs font-mono tracking-[0.3em] uppercase mb-2">Secure Checkout</p>
              <h1 className="text-4xl font-black text-white">
                You're getting<br/>
                <span className="gold-gradient">{selectedPlan.name} Plan</span>
              </h1>
              {plan !== 'free' && (
                <p className="text-slate-400 mt-2 text-sm">
                  7-day free trial · Cancel anytime · No charge until trial ends
                </p>
              )}
            </div>

            {/* Holographic card */}
            <HoloCard
              plan={selectedPlan.name}
              price={selectedPlan.price}
              features={Array.from(selectedPlan.features)}
              color={color}
            />

            {/* Features list */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm">
              <p className="text-white font-bold text-sm mb-4">What's included</p>
              <ul className="space-y-2.5">
                {(selectedPlan.features as string[]).map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                      <Check className="w-3 h-3" style={{ color }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {['🔒 SSL Encrypted', '💳 Stripe Secure', '↩️ Cancel Anytime', '🌍 Global'].map(b => (
                <span key={b} className="text-xs bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          {/* Right — Smart form */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 space-y-6">
            <div>
              <p className="text-white font-black text-xl mb-1">Your Details</p>
              <p className="text-slate-500 text-xs">Payment is processed securely by Stripe after this step.</p>
            </div>

            {/* Personal info */}
            <div className="space-y-4">
              <p className="text-amber-400/70 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Personal Information
              </p>
              <SmartInput
                label="Email Address" icon={Mail} type="email"
                value={form.email} onChange={e => set('email', e.target.value)}
                error={errors.email} placeholder="you@example.com"
                autoComplete="email"
              />
              <div className="grid grid-cols-2 gap-4">
                <SmartInput
                  label="First Name" icon={User}
                  value={form.firstName} onChange={e => set('firstName', e.target.value)}
                  error={errors.firstName} placeholder="Darren"
                  autoComplete="given-name"
                />
                <SmartInput
                  label="Last Name"
                  value={form.lastName} onChange={e => set('lastName', e.target.value)}
                  error={errors.lastName} placeholder="Neil"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Billing address */}
            <div className="space-y-4">
              <p className="text-amber-400/70 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Billing Address
              </p>

              {/* Postcode first — autofills city/county */}
              <div className="relative">
                <SmartInput
                  label="Postcode / ZIP"
                  value={form.postcode} onChange={e => set('postcode', e.target.value.toUpperCase())}
                  error={errors.postcode}
                  placeholder="SW1A 1AA"
                  hint={form.country === 'United Kingdom' ? 'Enter UK postcode — city and county auto-fill' : undefined}
                  autoComplete="postal-code"
                />
                {lookingUp && (
                  <div className="absolute right-3 top-9 text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
                {/* Suggestions */}
                {suggestions && (
                  <button
                    onClick={() => applyAddress(suggestions)}
                    className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-amber-500/40 rounded-xl p-3 text-left shadow-2xl hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{suggestions.city}{suggestions.county ? `, ${suggestions.county}` : ''}</p>
                        <p className="text-slate-400 text-xs">{suggestions.postcode} · {suggestions.country}</p>
                      </div>
                      <span className="ml-auto text-xs text-amber-400">Tap to fill →</span>
                    </div>
                  </button>
                )}
              </div>

              <SmartInput
                label="Address Line 1" icon={MapPin}
                value={form.line1} onChange={e => set('line1', e.target.value)}
                error={errors.line1} placeholder="123 High Street"
                autoComplete="address-line1"
              />
              <SmartInput
                label="Address Line 2 (optional)"
                value={form.line2} onChange={e => set('line2', e.target.value)}
                placeholder="Flat 4, Building name"
                autoComplete="address-line2"
              />
              <div className="grid grid-cols-2 gap-4">
                <SmartInput
                  label="City / Town"
                  value={form.city} onChange={e => set('city', e.target.value)}
                  error={errors.city} placeholder="London"
                  autoComplete="address-level2"
                />
                <SmartInput
                  label="County / State"
                  value={form.county} onChange={e => set('county', e.target.value)}
                  placeholder="Greater London"
                  autoComplete="address-level1"
                />
              </div>

              {/* Country selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Country</label>
                <div className="relative">
                  <select
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/60 appearance-none font-mono"
                    autoComplete="country-name"
                  >
                    {['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Payment note */}
            {plan !== 'free' && (
              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <CreditCard className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 text-sm font-semibold">Card Details Entered on Next Screen</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    After clicking below, you'll enter your card securely via Stripe.
                    Your card is never stored on our servers.
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={proceed}
              disabled={loading}
              className={clsx(
                'w-full py-4 rounded-xl font-black text-base transition-all duration-300 relative overflow-hidden',
                'disabled:opacity-60',
                plan !== 'free'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-[1.01]'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                </span>
              ) : plan === 'free' ? (
                'Start Free →'
              ) : (
                `Start 7-Day Free Trial — ${selectedPlan.name} Plan →`
              )}
              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            </button>

            <p className="text-slate-700 text-xs text-center">
              By continuing you agree to our Terms of Service and Privacy Policy.
              Cancel anytime from your account settings.
            </p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes scanLine {
          0%   { top: 0%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  )
}

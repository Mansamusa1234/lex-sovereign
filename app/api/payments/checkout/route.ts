import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json()

    if (!plan || plan === 'free') {
      return NextResponse.json({ url: `${APP_URL}/dashboard` })
    }

    const selectedPlan = PLANS[plan as PlanKey]
    if (!selectedPlan || !('priceId' in selectedPlan) || !selectedPlan.priceId) {
      return NextResponse.json({ error: 'Invalid plan or Stripe not configured. Add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to your Vercel env vars.' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email || undefined,
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/dashboard?subscribed=true&plan=${plan}`,
      cancel_url:  `${APP_URL}/pricing?cancelled=true`,
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
        trial_period_days: 7,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

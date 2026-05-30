import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanByPriceId } from '@/lib/stripe'
import { supabaseAdmin, logAudit } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: import('stripe').Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const sub = (event.data.object as any)

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const plan = getPlanByPriceId(sub.items?.data?.[0]?.price?.id ?? '')
      await supabaseAdmin.from('subscriptions').upsert({
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer,
        plan,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
      await logAudit({ action: 'subscription_updated', details: { plan, status: sub.status } })
      break
    }
    case 'customer.subscription.deleted': {
      await supabaseAdmin.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      await logAudit({ action: 'subscription_cancelled', details: { id: sub.id } })
      break
    }
  }

  return NextResponse.json({ received: true })
}

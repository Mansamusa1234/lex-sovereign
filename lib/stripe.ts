import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '5 AI questions per day',
      'Basic law library access',
      'Manual email entry',
      'Approval queue',
    ],
    limits: { daily_questions: 5 },
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    features: [
      'Unlimited AI questions',
      'Full 30+ statute law library',
      'Gmail sync & email drafting',
      'Voice input & text-to-speech',
      'PDF & DOCX document upload',
      'All 26 languages',
      'Full audit trail',
      'Priority support',
    ],
    limits: { daily_questions: Infinity },
    highlight: true,
  },
  business: {
    name: 'Business',
    price: 79,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? '',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Custom knowledge base',
      'White-label option',
      'API access',
      'Dedicated support',
      'Custom legal templates',
      'Agent settings per user',
    ],
    limits: { daily_questions: Infinity },
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanByPriceId(priceId: string): PlanKey {
  if (priceId === PLANS.pro.priceId) return 'pro'
  if (priceId === PLANS.business.priceId) return 'business'
  return 'free'
}

// Client-safe plan configuration — no Stripe SDK imports
// Use this in 'use client' components

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 AI questions per day',
      'Basic law library access',
      'Manual email entry',
      'Approval queue',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    highlight: true,
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
  },
  business: {
    name: 'Business',
    price: 79,
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
  },
} as const

export type PlanKey = keyof typeof PLANS

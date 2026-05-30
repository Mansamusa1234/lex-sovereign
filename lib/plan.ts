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
highlight: true as const,
features: [
'Unlimited AI questions',
'Full 30+ statute law library',
'Gmail sync & email drafting',
'Voice input & text-to-speech',
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
'Dedicated support',
],
},
} as const

export type PlanKey = keyof typeof PLANS

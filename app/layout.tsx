import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/ToastProvider'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'
const APP_NAME = 'Lex Sovereign AI Brain'
const DESCRIPTION = 'AI-powered legal research assistant. Know your FDCPA & FCRA rights, draft responses to debt collectors, courts, and government agencies. UCC 1-308. All rights reserved. Not a lawyer.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Know Your Rights With AI`,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'legal research AI', 'debt collector rights', 'FDCPA rights', 'FCRA rights',
    'AI legal assistant', 'cease and desist letter', 'debt validation letter',
    'know your rights', 'consumer rights AI', 'UCC 1-308', 'all rights reserved',
    'legal drafting tool', 'lex sovereign', 'debt collection defense',
    'credit report dispute', 'sovereign rights', 'procedural law AI',
    'habeas corpus', 'due process rights', 'legal research tool free',
  ],
  authors: [{ name: 'Lex Sovereign AI Brain', url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: 'Legal Technology',
  classification: 'Legal Research Tool',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn, Discord) ──────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'fr_FR', 'de_DE', 'pt_BR'],
    url: APP_URL,
    siteName: APP_NAME,
    title: 'Lex Sovereign AI Brain — Know Your Rights. Draft Your Response.',
    description: 'Fight debt collectors with AI. Research FDCPA, FCRA, UCC 1-308 rights instantly. Three AI agents — Sovereign, Lex & Aria — research and draft for you. Human approval always required.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Lex Sovereign AI Brain — Know Your Rights. Draft Your Response.',
        type: 'image/svg+xml',
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@LexSovereignAI',
    creator: '@LexSovereignAI',
    title: 'Lex Sovereign AI Brain — Fight Back With AI-Powered Law Research',
    description: 'Know your FDCPA & FCRA rights. Draft cease & desist letters. Respond to debt collectors professionally. AI research tool — not a lawyer.',
    images: ['/og-image.svg'],
  },

  // ── App / PWA ─────────────────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lex Sovereign',
    startupImage: '/og-image.svg',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon.svg',
    shortcut: '/icons/icon.svg',
  },

  // ── Verification codes (fill in after verifying each platform) ───────────
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',    // from Google Search Console
    yandex: 'YOUR_YANDEX_VERIFICATION_CODE',    // optional
    yahoo:  'YOUR_YAHOO_VERIFICATION_CODE',     // optional
    other:  {
      'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE',   // Bing Webmaster Tools
      'p:domain_verify': 'YOUR_PINTEREST_VERIFY_CODE',  // Pinterest
    },
  },

  alternates: {
    canonical: APP_URL,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#f59e0b' },
    { media: '(prefers-color-scheme: light)', color: '#f59e0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* PWA / Apple */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lex Sovereign" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />

        {/* Additional social / SEO */}
        <meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID" />
        <meta name="instagram:site" content="@lexsovereignai" />
        <meta name="linkedin:owner" content="lex-sovereign-ai-brain" />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: APP_NAME,
                applicationCategory: 'LegalApplication',
                applicationSubCategory: 'Legal Research Tool',
                operatingSystem: 'Web, iOS, Android',
                description: DESCRIPTION,
                url: APP_URL,
                image: `${APP_URL}/og-image.svg`,
                inLanguage: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'],
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
                featureList: [
                  'FDCPA rights research', 'FCRA credit dispute assistance', 'UCC 1-308 reservation of rights',
                  'Debt validation letter drafting', 'Cease and desist letter drafting',
                  'Gmail integration', 'Human approval workflow', '26 language support',
                  'Full audit trail', 'AI-powered legal research',
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: APP_NAME,
                url: APP_URL,
                logo: `${APP_URL}/icons/icon.svg`,
                sameAs: [
                  'https://twitter.com/LexSovereignAI',
                  'https://www.facebook.com/lexsovereignai',
                  'https://www.instagram.com/lexsovereignai',
                  'https://www.tiktok.com/@lexsovereignai',
                  'https://www.youtube.com/@lexsovereignai',
                  'https://www.linkedin.com/company/lex-sovereign-ai',
                  'https://reddit.com/r/lexsovereign',
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  availableLanguage: ['English', 'Spanish', 'French', 'German'],
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Is Lex Sovereign AI Brain a law firm?',
                    acceptedAnswer: { '@type': 'Answer', text: 'No. Lex Sovereign AI Brain is a legal research and drafting tool, not a law firm. It does not provide legal advice. Always consult a qualified attorney for your specific legal situation.' },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is UCC 1-308?',
                    acceptedAnswer: { '@type': 'Answer', text: 'UCC 1-308 (Performance Under Reservation of Rights) allows a party to perform or accept a contract while explicitly reserving their rights. Writing "Without Prejudice UCC 1-308" signals you are not waiving any legal rights.' },
                  },
                  {
                    '@type': 'Question',
                    name: 'What are my rights under the FDCPA?',
                    acceptedAnswer: { '@type': 'Answer', text: 'The Fair Debt Collection Practices Act (15 U.S.C. § 1692) gives you the right to demand debt validation, dispute debts in writing, stop collection calls, and sue collectors who violate the law for damages up to $1,000 plus attorney fees.' },
                  },
                  {
                    '@type': 'Question',
                    name: 'Can the AI draft letters automatically?',
                    acceptedAnswer: { '@type': 'Answer', text: 'The AI drafts responses but nothing is ever sent automatically. Every draft requires your explicit review and approval before being pushed to Gmail. You can also edit drafts before approving.' },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="bg-slate-950 text-white antialiased min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

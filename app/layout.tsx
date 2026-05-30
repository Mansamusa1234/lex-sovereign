import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/ToastProvider'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Lex Sovereign AI Brain — Legal Research & Drafting Assistant',
    template: '%s | Lex Sovereign AI Brain',
  },
  description:
    'AI-powered legal research and drafting assistant. Know your rights, draft professional responses to debt collectors, courts, and government agencies — instantly. Not a lawyer.',
  keywords: [
    'legal research AI',
    'debt collector rights',
    'FDCPA',
    'FCRA',
    'AI legal assistant',
    'cease and desist letter',
    'debt validation letter',
    'know your rights',
    'consumer rights',
    'legal drafting tool',
    'AI brain legal',
    'lex sovereign',
  ],
  authors: [{ name: 'Lex Sovereign' }],
  creator: 'Lex Sovereign AI Brain',
  publisher: 'Lex Sovereign AI Brain',
  category: 'Legal Technology',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'Lex Sovereign AI Brain',
    title: 'Lex Sovereign AI Brain — Know Your Rights With AI',
    description:
      'Fight back against debt collectors, understand your legal rights, and draft professional responses — powered by AI. Research assistant, not a lawyer.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lex Sovereign AI Brain — Legal Research and Drafting Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lex Sovereign AI Brain — Legal Research Assistant',
    description:
      'AI-powered tool to research your rights and draft responses to debt collectors, courts, and government agencies.',
    images: ['/og-image.png'],
    creator: '@lexsovereign',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lex Sovereign',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
    shortcut: '/icons/icon.svg',
  },
  verification: {
    google: '',
  },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lex Sovereign" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Lex Sovereign AI Brain',
              applicationCategory: 'LegalApplication',
              operatingSystem: 'Web, iOS, Android',
              description:
                'AI-powered legal research and drafting assistant for consumer rights, debt collection responses, and legal document drafting.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '47',
              },
              featureList: [
                'Debt collector response drafting',
                'FDCPA rights research',
                'FCRA credit report dispute assistance',
                'Gmail integration',
                'AI-powered legal research',
                '26 language support',
                'Human approval workflow',
              ],
              url: 'https://lex-sovereign-f6m4.vercel.app',
            }),
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

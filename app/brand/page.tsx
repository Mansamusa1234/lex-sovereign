import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Brand Assets & Marketing | Lex Sovereign AI Brain',
  description: 'Download official Lex Sovereign AI Brain brand assets, ad creatives, and marketing materials.',
}

const ASSETS = [
  { name: 'Leaderboard Banner', size: '728×90px', file: '/ads/banner-728x90.svg', use: 'Google Display, website headers' },
  { name: 'Square Ad', size: '1080×1080px', file: '/ads/square-1080x1080.svg', use: 'Instagram, Facebook, LinkedIn posts' },
  { name: 'Story / Reel', size: '1080×1920px', file: '/ads/story-1080x1920.svg', use: 'Instagram Stories, TikTok, Facebook Stories' },
  { name: 'App Icon', size: 'SVG', file: '/icons/icon.svg', use: 'App icon, favicon, social profiles' },
  { name: 'OG Share Image', size: '1200×630px', file: '/og-image.svg', use: 'Link previews on all platforms' },
]

const PLATFORMS = [
  { name: 'TikTok', icon: '🎵', handle: '@lexsovereignai', color: 'bg-black border-pink-500/30 text-pink-400' },
  { name: 'Instagram', icon: '📸', handle: '@lexsovereignai', color: 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-pink-500/30 text-pink-300' },
  { name: 'Twitter / X', icon: '🐦', handle: '@LexSovereignAI', color: 'bg-slate-900 border-slate-700 text-slate-300' },
  { name: 'Facebook', icon: '👤', handle: '/lexsovereignai', color: 'bg-blue-900/30 border-blue-500/30 text-blue-300' },
  { name: 'YouTube', icon: '▶', handle: '@lexsovereignai', color: 'bg-red-900/20 border-red-500/30 text-red-300' },
  { name: 'LinkedIn', icon: '💼', handle: 'lex-sovereign-ai-brain', color: 'bg-blue-900/30 border-blue-700/30 text-blue-400' },
]

const COPY_BLOCKS = [
  {
    title: 'Short Bio (social media)',
    text: '⚖️ AI Legal Research Tool\nKnow your FDCPA, FCRA & UCC rights\nDraft professional responses with AI\nNot a lawyer — a powerful tool\nFree to start',
  },
  {
    title: 'Medium Description',
    text: 'Lex Sovereign AI Brain is an AI-powered legal research and drafting assistant. Three AI agents — Sovereign, Lex, and Aria — research real statutes and draft professional responses to debt collectors, courts, and government agencies. Human approval always required. Not a law firm.',
  },
  {
    title: 'TikTok Hook #1',
    text: '"A debt collector just sent me THIS letter. Here\'s what my AI drafted back in 30 seconds..."',
  },
  {
    title: 'TikTok Hook #2',
    text: '"Most people don\'t know these FDCPA rights. The law says debt collectors CANNOT do this..."',
  },
  {
    title: 'Google Ad Headline',
    text: 'Know Your Debt Collection Rights | AI Legal Research Tool | FDCPA & FCRA Explained',
  },
]

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="legal-grid" aria-hidden />

      {/* Nav */}
      <nav className="border-b border-amber-500/10 px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">⚖</div>
            <span className="font-black text-white">Lex Sovereign</span>
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* Header */}
        <div className="text-center">
          <p className="text-amber-400/60 text-xs font-mono tracking-[0.3em] uppercase mb-4">Marketing HQ</p>
          <h1 className="text-4xl font-black text-white mb-3">Brand Assets & Marketing Kit</h1>
          <p className="text-slate-400">Download ad creatives, copy, and assets for every platform.</p>
        </div>

        {/* Ad Creatives */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6">Ad Creatives — Download & Use</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASSETS.map(asset => (
              <div key={asset.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                <div className="w-full h-24 bg-slate-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <img src={asset.file} alt={asset.name} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="text-white font-bold text-sm">{asset.name}</p>
                <p className="text-amber-400/70 text-xs font-mono mt-0.5">{asset.size}</p>
                <p className="text-slate-500 text-xs mt-1 mb-3">{asset.use}</p>
                <a href={asset.file} download
                  className="flex items-center gap-2 w-full justify-center py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Platform handles */}
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Social Media Handles</h2>
          <p className="text-slate-400 text-sm mb-6">Create these accounts using the same handle everywhere for brand consistency.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLATFORMS.map(p => (
              <div key={p.name} className={`border rounded-xl p-4 flex items-center gap-3 ${p.color}`}>
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs opacity-70 font-mono">{p.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copy blocks */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6">Ready-to-Use Copy</h2>
          <div className="space-y-4">
            {COPY_BLOCKS.map(block => (
              <div key={block.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">{block.title}</p>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-slate-800 rounded-xl p-4">
                  {block.text}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Key hashtags */}
        <div>
          <h2 className="text-2xl font-black text-white mb-4">Master Hashtag Set</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-300 text-sm font-mono leading-relaxed">
              #FDCPA #FCRA #knowyourrights #debtcollector #creditrepair #UCC1308 #allrightsreserved #legalAI #AItools #consumerrights #debtvalidation #ceaseanddesist #legalresearch #financialfreedom #sovereignrights #dueprocess #5thamendment #legaltech #debtfree #PACEact #consumercredit #FCA #DWP #HMRC
            </p>
          </div>
        </div>

        {/* Marketing docs */}
        <div>
          <h2 className="text-2xl font-black text-white mb-4">Marketing Documents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Complete Advertising Guide', desc: 'Google Ads, Meta Ads, TikTok, YouTube, email sequences, press release', file: '/ADVERTISING_COMPLETE.md' },
              { label: 'Social Media Marketing Guide', desc: 'All platforms, exact bios, content calendar, hashtags, directory listings', file: '/SOCIAL_MEDIA_MARKETING.md' },
              { label: 'Business Guide', desc: 'Revenue models, pricing, target markets, monetisation strategy', file: '/BUSINESS_GUIDE.md' },
              { label: 'Quick Start Guide', desc: 'Deploy in 15 minutes, step-by-step', file: '/QUICK_START.md' },
            ].map(doc => (
              <div key={doc.label} className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition-colors">
                <p className="text-white font-bold">{doc.label}</p>
                <p className="text-slate-500 text-sm mt-1 mb-3">{doc.desc}</p>
                <a href={doc.file} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Document
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-600 text-xs">Lex Sovereign AI Brain · Legal Research Tool · Not a Law Firm</p>
        </div>
      </div>
    </div>
  )
}

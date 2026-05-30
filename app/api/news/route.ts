import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Free RSS feeds for legal news — no API key required
const FEEDS = [
  {
    name: 'Which? Consumer Rights',
    url: 'https://www.which.co.uk/news/rss.xml',
    category: 'consumer',
  },
  {
    name: 'Money Saving Expert',
    url: 'https://www.moneysavingexpert.com/rss/all/',
    category: 'finance',
  },
  {
    name: 'Gov.uk Consultations',
    url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=consumer+rights',
    category: 'government',
  },
  {
    name: 'CFPB Newsroom (US)',
    url: 'https://www.consumerfinance.gov/about-us/newsroom/feed/',
    category: 'consumer',
  },
  {
    name: 'FTC News (US)',
    url: 'https://www.ftc.gov/news-events/news/rss.xml',
    category: 'government',
  },
]

interface NewsItem {
  title: string
  link: string
  summary: string
  published: string
  source: string
  category: string
}

function parseXML(xml: string, sourceName: string, category: string): NewsItem[] {
  const items: NewsItem[] = []
  // Simple XML parsing without external library
  const itemRegex = /<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const block = match[1] || match[2]
    if (!block) continue

    const title   = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? ''
    const link    = block.match(/<link[^>]*>([^<]+)<\/link>|<link[^>]*href="([^"]+)"/)?.[1]?.trim() ??
                    block.match(/<link[^>]*href="([^"]+)"/)?.[1]?.trim() ?? ''
    const summary = (
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ??
      block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? ''
    ).replace(/<[^>]+>/g, '').trim().slice(0, 200)

    const pub = block.match(/<pubDate[^>]*>([^<]+)<\/pubDate>|<published[^>]*>([^<]+)<\/published>/)?.[1]?.trim()
             ?? block.match(/<updated[^>]*>([^<]+)<\/updated>/)?.[1]?.trim()
             ?? ''

    if (title && (link || pub)) {
      items.push({ title, link, summary, published: pub, source: sourceName, category })
    }
  }
  return items
}

async function fetchFeed(feed: typeof FEEDS[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'LexSovereign/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseXML(xml, feed.name, feed.category)
  } catch {
    return []
  }
}

let cache: { items: NewsItem[]; at: number } | null = null
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET(req: NextRequest) {
  const category = new URL(req.url).searchParams.get('category')

  // Return cached if fresh
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    const items = category ? cache.items.filter(i => i.category === category) : cache.items
    return NextResponse.json({ items, cached: true })
  }

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(FEEDS.map(fetchFeed))
  const all: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // Sort by date descending
  all.sort((a, b) => {
    const da = a.published ? new Date(a.published).getTime() : 0
    const db = b.published ? new Date(b.published).getTime() : 0
    return db - da
  })

  cache = { items: all.slice(0, 40), at: Date.now() }

  const items = category ? all.filter(i => i.category === category) : all.slice(0, 40)
  return NextResponse.json({ items, cached: false, total: all.length })
}

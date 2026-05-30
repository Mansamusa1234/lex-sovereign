import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/gmail'

export async function GET() {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Gmail is not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your .env.local file first.' },
      { status: 500 }
    )
  }
  const url = getAuthUrl()
  return NextResponse.redirect(url)
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')
  if (!email) {
    return new NextResponse('Missing email', { status: 400 })
  }

  await supabaseAdmin
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', decodeURIComponent(email).toLowerCase())

  return new NextResponse(`<!DOCTYPE html>
<html><body style="background:#020617;color:#e2e8f0;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="text-align:center;max-width:400px;padding:40px;">
  <div style="font-size:48px;margin-bottom:16px;">✓</div>
  <h1 style="color:#f59e0b;margin:0 0 12px;">Unsubscribed</h1>
  <p style="color:#64748b;">You have been removed from the Lex Sovereign mailing list.</p>
  <a href="${APP_URL}" style="display:inline-block;margin-top:24px;color:#f59e0b;text-decoration:none;">Return to app →</a>
</div>
</body></html>`, { headers: { 'Content-Type': 'text/html' } })
}

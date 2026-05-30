import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return new NextResponse(html(`
      <h2 style="color:#f87171">Gmail Authorization Failed</h2>
      <p>Google returned an error: <code>${error}</code></p>
      <p><a href="/setup" style="color:#fbbf24">Back to Setup</a></p>
    `), { headers: { 'Content-Type': 'text/html' } })
  }

  if (!code) {
    return new NextResponse(html(`
      <h2 style="color:#f87171">No Authorization Code</h2>
      <p>Google did not return an authorization code.</p>
      <p><a href="/setup" style="color:#fbbf24">Back to Setup</a></p>
    `), { headers: { 'Content-Type': 'text/html' } })
  }

  try {
    const tokens = await exchangeCode(code)
    const refreshToken = tokens.refresh_token

    console.log('\n✅ Gmail OAuth successful! Add this to your .env.local:')
    console.log(`GMAIL_REFRESH_TOKEN=${refreshToken}\n`)

    return new NextResponse(html(`
      <h2 style="color:#34d399">Gmail Connected!</h2>
      <p>Your refresh token is shown below. Copy it and add it to your <code>.env.local</code> file:</p>
      <pre style="background:#0f172a;border:1px solid #334155;padding:1rem;border-radius:8px;word-break:break-all;text-align:left">GMAIL_REFRESH_TOKEN=${refreshToken ?? '(no refresh token — make sure you enabled offline access)'}</pre>
      <p style="margin-top:1rem">After saving, restart your dev server, then <a href="/emails" style="color:#fbbf24">go to Emails</a>.</p>
      ${!refreshToken ? `<p style="color:#fbbf24">⚠️ No refresh token was returned. Delete the app from your <a href="https://myaccount.google.com/permissions" style="color:#fbbf24">Google account permissions</a> and try again.</p>` : ''}
    `), { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    return new NextResponse(html(`
      <h2 style="color:#f87171">Token Exchange Failed</h2>
      <pre style="background:#0f172a;padding:1rem;border-radius:8px;text-align:left;word-break:break-all">${(err as Error).message}</pre>
      <p><a href="/setup" style="color:#fbbf24">Back to Setup</a></p>
    `), { headers: { 'Content-Type': 'text/html' } })
  }
}

function html(body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Gmail Setup — Lex Sovereign</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;background:#020617;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem">
  <div style="max-width:600px;width:100%;background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:2rem">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">
      <div style="width:36px;height:36px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">⚖</div>
      <span style="font-weight:600;color:white">Lex Sovereign AI Brain</span>
    </div>
    ${body}
  </div>
</body>
</html>`
}

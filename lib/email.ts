// Email marketing via Resend — free tier: 3,000 emails/month
// Sign up at resend.com → Developers → API Keys → add RESEND_API_KEY to Vercel

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL     = process.env.EMAIL_FROM ?? 'Lex Sovereign AI Brain <hello@lexsovereign.app>'
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email not sent')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message ?? 'Send failed' }
    return { success: true, id: data.id }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lex Sovereign AI Brain</title>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:0 0 32px 0;" align="center">
          <div style="display:inline-flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:#f59e0b;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;">⚖</div>
            <div>
              <div style="color:#f59e0b;font-weight:900;font-size:18px;letter-spacing:1px;">LEX SOVEREIGN</div>
              <div style="color:#475569;font-size:11px;letter-spacing:2px;text-transform:uppercase;">AI Brain</div>
            </div>
          </div>
        </td></tr>

        <!-- Content -->
        <tr><td style="background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:40px;color:#cbd5e1;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;color:#334155;font-size:12px;line-height:1.8;">
          <p>Lex Sovereign AI Brain · Legal Research &amp; Drafting Assistant</p>
          <p>Not a law firm · Not legal advice · Always consult a qualified attorney</p>
          <p>
            <a href="${APP_URL}" style="color:#f59e0b;text-decoration:none;">Open App</a> &nbsp;·&nbsp;
            <a href="${APP_URL}/api/email/unsubscribe?email={{email}}" style="color:#475569;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function welcomeEmail(name: string, email: string): string {
  return baseTemplate(`
    <h1 style="color:#f59e0b;font-size:28px;font-weight:900;margin:0 0 8px;">Welcome to Lex Sovereign</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 32px;text-transform:uppercase;letter-spacing:2px;">Legal Research & Drafting Assistant</p>

    <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">Hi ${name || 'there'},</p>

    <p style="font-size:16px;line-height:1.8;margin:0 0 24px;">
      You're now connected to three AI agents — <strong style="color:#f59e0b;">Sovereign</strong>, <strong style="color:#60a5fa;">Lex</strong>, and <strong style="color:#34d399;">Aria</strong> — who research real law and draft professional responses on your behalf.
    </p>

    <div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:24px;margin:0 0 32px;">
      <p style="color:#f59e0b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Start Here</p>
      <p style="margin:0 0 8px;">1. Go to <strong>/setup</strong> → Seed Knowledge Base</p>
      <p style="margin:0 0 8px;">2. Ask: <em>"What are my rights when a debt collector contacts me?"</em></p>
      <p style="margin:0;">3. Watch Sovereign, Lex, and Aria respond in real-time</p>
    </div>

    <div style="background:#020617;border:1px solid #f59e0b33;border-radius:12px;padding:20px;margin:0 0 32px;">
      <p style="color:#f59e0b;font-size:13px;font-weight:700;margin:0 0 8px;">⚖ This Week's Legal Right</p>
      <p style="margin:0;font-size:14px;line-height:1.7;">Under the FDCPA (15 U.S.C. § 1692g), you have <strong>30 days</strong> to dispute a debt in writing. Once disputed, the collector must cease collection until they provide verification.</p>
    </div>

    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#020617;font-weight:900;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
      Open the AI Brain →
    </a>

    <p style="margin:32px 0 0;font-size:13px;color:#475569;">
      Remember: Lex Sovereign is a legal research and drafting tool — not a law firm. Always consult a qualified attorney for your specific situation.
    </p>
  `).replace('{{email}}', encodeURIComponent(email))
}

export function marketingEmail(params: {
  name: string
  email: string
  subject_line: string
  headline: string
  body: string
  cta_text: string
  cta_url: string
  tip_title?: string
  tip_content?: string
}): string {
  return baseTemplate(`
    <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 24px;line-height:1.3;">${params.headline}</h1>

    <p style="font-size:15px;line-height:1.8;margin:0 0 24px;">${params.body}</p>

    ${params.tip_title ? `
    <div style="background:#020617;border-left:3px solid #f59e0b;padding:16px 20px;margin:0 0 32px;border-radius:0 8px 8px 0;">
      <p style="color:#f59e0b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">${params.tip_title}</p>
      <p style="margin:0;font-size:14px;line-height:1.7;">${params.tip_content}</p>
    </div>` : ''}

    <a href="${params.cta_url}" style="display:inline-block;background:#f59e0b;color:#020617;font-weight:900;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      ${params.cta_text}
    </a>
  `).replace('{{email}}', encodeURIComponent(params.email))
}

export function newsletterEmail(params: {
  email: string
  week_number: number
  law_of_the_week: { title: string; content: string; source: string }
  tip: string
}): string {
  return baseTemplate(`
    <p style="color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Legal Intelligence · Week ${params.week_number}</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 32px;">Your Weekly Rights Update</h1>

    <div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:24px;margin:0 0 24px;">
      <p style="color:#f59e0b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Law of the Week</p>
      <h2 style="color:#ffffff;font-size:18px;margin:0 0 12px;">${params.law_of_the_week.title}</h2>
      <p style="font-size:14px;line-height:1.8;margin:0 0 12px;">${params.law_of_the_week.content}</p>
      <p style="color:#475569;font-size:12px;margin:0;">Source: ${params.law_of_the_week.source}</p>
    </div>

    <div style="background:#020617;border:1px solid #1e293b;border-radius:12px;padding:24px;margin:0 0 32px;">
      <p style="color:#34d399;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Quick Tip from Aria</p>
      <p style="font-size:14px;line-height:1.8;margin:0;">${params.tip}</p>
    </div>

    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#f59e0b;color:#020617;font-weight:900;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
      Research This Week's Rights →
    </a>
  `).replace('{{email}}', encodeURIComponent(params.email))
}

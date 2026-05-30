import { google } from 'googleapis'

function getOAuth2Client() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
  return oauth2
}

export function getGmailClient() {
  return google.gmail({ version: 'v1', auth: getOAuth2Client() })
}

// Returns the OAuth2 URL for the first-time setup flow
export function getAuthUrl(): string {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
    ],
    prompt: 'consent',
  })
}

// Exchange auth code for tokens (first-time setup)
export async function exchangeCode(code: string) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  const { tokens } = await oauth2.getToken(code)
  return tokens
}

// ── Email helpers ─────────────────────────────────────────────────────────────

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function extractBody(payload: any): string {
  if (!payload) return ''
  if (payload.body?.data) return decodeBase64Url(payload.body.data)
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data)
      }
    }
    for (const part of payload.parts) {
      const nested = extractBody(part)
      if (nested) return nested
    }
  }
  return ''
}

export interface GmailMessage {
  id: string
  threadId: string
  subject: string
  sender: string
  recipient: string
  body: string
  date: string
}

export async function listRecentEmails(maxResults = 20): Promise<GmailMessage[]> {
  const gmail = getGmailClient()
  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox',
  })

  const messages = list.data.messages ?? []
  const results: GmailMessage[] = []

  for (const msg of messages) {
    if (!msg.id) continue
    try {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' })
      const headers: Record<string, string> = {}
      for (const h of full.data.payload?.headers ?? []) {
        headers[h.name?.toLowerCase() ?? ''] = h.value ?? ''
      }
      results.push({
        id: msg.id,
        threadId: msg.threadId ?? '',
        subject: headers['subject'] ?? '(no subject)',
        sender: headers['from'] ?? '',
        recipient: headers['to'] ?? '',
        body: extractBody(full.data.payload),
        date: headers['date'] ?? '',
      })
    } catch {
      // skip malformed messages
    }
  }
  return results
}

export async function createGmailDraft(params: {
  to: string
  subject: string
  body: string
  threadId?: string
}): Promise<string> {
  const gmail = getGmailClient()

  const raw = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    params.body,
  ].join('\r\n')

  const encoded = Buffer.from(raw).toString('base64url')

  const draft = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encoded,
        threadId: params.threadId,
      },
    },
  })

  return draft.data.id ?? ''
}

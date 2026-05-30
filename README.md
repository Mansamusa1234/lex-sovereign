# Lex Sovereign AI Brain

A shared AI brain for legal research and email drafting.  
**This is a legal research and drafting assistant — not a lawyer.**  
Always consult a qualified attorney for actual legal advice.

---

## What It Does

| Feature | Description |
|---|---|
| Supreme Orchestrator | Routes your questions to the right agent and assembles answers |
| Legal Research Agent | Searches your knowledge base (statutes, case law, definitions) using AI |
| Email Drafting Agent | Reads Gmail, classifies emails, drafts replies for your approval |
| Human Approval Queue | Nothing is ever sent automatically — every draft needs your OK |
| Risk Checker | Flags unsupported claims, unverified citations, and legal demands |
| Shared Memory | All agents share a vector database (pgvector) for memory and search |
| Document Upload | Upload PDF/DOCX files; the AI can search and quote from them |
| Knowledge Base | Add statutes, definitions, Black's Law Dictionary entries, templates |
| Audit Log | Every AI action is recorded with full details |

---

## Prerequisites

You need these accounts before you start. All have free tiers.

- [Supabase](https://supabase.com) — free account (database + auth)
- [OpenAI](https://platform.openai.com) — API key (pay-per-use)
- [Google Cloud Console](https://console.cloud.google.com) — for Gmail API (free)
- [Vercel](https://vercel.com) — for deployment (free tier available)
- [Node.js 18+](https://nodejs.org) or [Bun](https://bun.sh) — for local development

---

## Step 1 — Clone and Install

```bash
# 1. Copy the project to your computer
cd ~/Desktop
cp -r path/to/lex-sovereign-ai-brain ./my-legal-brain
cd my-legal-brain

# 2. Install dependencies (choose one)
npm install
# or
bun install
```

---

## Step 2 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and click **New project**
2. Pick a name (e.g. `lex-brain`) and set a strong database password
3. Wait for the project to provision (about 1 minute)
4. In your Supabase dashboard, go to **Settings → API**
5. Copy these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (keep this secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### Enable pgvector

1. In Supabase dashboard, click **Database → Extensions**
2. Search for `vector` and click **Enable**

### Run the database migration

1. Click **SQL Editor** in the left sidebar
2. Open the file `supabase/migrations/001_initial.sql` from this project
3. Paste the entire contents into the SQL editor
4. Click **Run** — you should see "Success" with no errors

---

## Step 3 — Get Your OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key — it starts with `sk-`
4. This becomes your `OPENAI_API_KEY`

> **Cost note:** The app uses `gpt-4o` for drafting and `text-embedding-ada-002` for memory search.
> A typical session costs a few cents. Set a spending limit in your OpenAI account to be safe.

---

## Step 4 — Set Up Gmail API

This allows the app to read your inbox and save draft replies.

### 4a. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `lex-brain` and click **Create**

### 4b. Enable the Gmail API

1. In the search bar at the top, type `Gmail API`
2. Click on **Gmail API** in results
3. Click **Enable**

### 4c. Create OAuth2 credentials

1. Click **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. If prompted to configure the consent screen:
   - User type: **External**
   - App name: `Lex Brain`
   - Add your email as a test user
   - Save and continue
4. Back in Credentials: Application type = **Web application**
5. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/gmail/callback`
6. Click **Create** — copy the **Client ID** and **Client Secret**

### 4d. Get your refresh token

1. Create your `.env.local` file (see Step 5 first)
2. Start the dev server: `npm run dev`
3. Visit: `http://localhost:3000/api/auth/gmail`
4. Authorize the app in the Google popup
5. You will be redirected back — check the terminal for the refresh token
6. Paste the refresh token into `.env.local` as `GMAIL_REFRESH_TOKEN`

---

## Step 5 — Create Your Environment File

```bash
cp .env.example .env.local
```

Open `.env.local` in any text editor and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-...

GMAIL_CLIENT_ID=xxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-...
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
GMAIL_REFRESH_TOKEN=1//xxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
API_SECRET=change-this-to-a-random-string
```

---

## Step 6 — Add a Gmail OAuth Callback Route

Create this file so the Gmail setup flow works:

**`app/api/auth/gmail/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/gmail'

export async function GET() {
  return NextResponse.redirect(getAuthUrl())
}
```

**`app/api/auth/gmail/callback/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })
  const tokens = await exchangeCode(code)
  console.log('GMAIL_REFRESH_TOKEN =', tokens.refresh_token)
  return NextResponse.json({ message: 'Copy the refresh token from your terminal', tokens })
}
```

---

## Step 7 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will land on the dashboard.

### First things to do

1. **Add knowledge entries** → go to `/knowledge` and add statutes, definitions, or templates
2. **Upload documents** → go to `/documents` and upload any PDF letters or notices you have
3. **Sync Gmail** → go to `/emails` and click "Sync Gmail" to import your inbox
4. **Ask a question** → on the dashboard, try: *"What are my rights when a debt collector contacts me?"*

---

## Step 8 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts, then add environment variables:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add GMAIL_CLIENT_ID
vercel env add GMAIL_CLIENT_SECRET
vercel env add GMAIL_REDIRECT_URI      # set to https://your-app.vercel.app/api/auth/gmail/callback
vercel env add GMAIL_REFRESH_TOKEN
vercel env add NEXT_PUBLIC_APP_URL     # set to https://your-app.vercel.app
vercel env add API_SECRET

# Redeploy with env vars
vercel --prod
```

> After deploying, update the **Authorized redirect URI** in Google Cloud Console to your Vercel URL.

---

## How to Add Knowledge (Important)

The AI only cites things that are in your knowledge base. **The more you add, the better it works.**

Go to `/knowledge` and click **Add Entry**. Suggested starting entries:

| Title | Category | Source |
|---|---|---|
| FDCPA Section 809 — Debt Validation Rights | statute | 15 U.S.C. § 1692g |
| FDCPA Section 805 — Communication Restrictions | statute | 15 U.S.C. § 1692c |
| FCRA Section 609 — Request for File Disclosure | statute | 15 U.S.C. § 1681g |
| Cease and Desist Template | template | Internal |
| Debt Validation Request Template | template | Internal |
| Estoppel (definition) | definition | Black's Law Dictionary 11th ed. |

---

## Adding More Agents (Future)

The system is designed for 30 agents. To add a new agent:

1. Create `lib/agents/yourAgent.ts` following the same pattern as `legalResearch.ts`
2. Register it in `supabase` via SQL: `INSERT INTO agents (name, type) VALUES ('Your Agent', 'custom');`
3. Add a case in `lib/agents/orchestrator.ts` to invoke your agent
4. That's it — it automatically shares memory with all other agents

---

## Important Rules (Built Into the System)

- **Nothing is ever auto-sent.** Every email reply requires your approval.
- **The AI never fabricates law.** If a citation is not in your knowledge base, it flags it.
- **Human edits become memory.** When you edit a draft before approving, the AI learns from your changes.
- **Every action is logged.** The audit log at `/audit` shows everything the AI has done.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `pgvector not found` | Enable the `vector` extension in Supabase → Database → Extensions |
| Gmail sync fails | Run the OAuth flow again at `/api/auth/gmail` to get a fresh refresh token |
| OpenAI errors | Check your API key and billing at platform.openai.com |
| Embeddings not working | Make sure `text-embedding-ada-002` is available on your OpenAI plan |
| Build fails on pdf-parse | This is server-only — make sure you're not importing it in client components |

---

## Legal Disclaimer

This software is a **research and drafting tool only**. It is not a law firm, not a lawyer, and does not provide legal advice. The information it provides is for educational and organizational purposes. For any legal matter — especially involving courts, lawsuits, debt collectors, or government agencies — consult a licensed attorney in your jurisdiction.

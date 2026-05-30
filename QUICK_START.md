# Quick Start — 15 Minutes to Live

This is the fastest path from zero to a working, deployed app.

---

## What You Need (All Free to Start)

| Account | Why | Link |
|---------|-----|------|
| GitHub | Store your code | github.com |
| Vercel | Host the app free | vercel.com |
| Supabase | Database free tier | supabase.com |
| OpenAI | AI API | platform.openai.com |

Gmail API is optional — you can add emails manually without it.

---

## Step 1 — Upload to GitHub (2 min)

1. Create a free GitHub account at github.com
2. Click **New repository** — name it `lex-sovereign`
3. Upload this entire project folder (drag the `lex-sovereign-ai-brain` folder contents)
4. Click **Commit changes**

---

## Step 2 — Set Up Supabase (5 min)

1. Go to supabase.com → **New project** → name it `lex-brain`
2. Wait 1 minute for it to provision
3. Click **Database** → **Extensions** → search `vector` → **Enable**
4. Click **SQL Editor** → paste the contents of `supabase/migrations/001_initial.sql` → **Run**
5. Repeat for `002_agent_settings.sql` and `003_rls.sql`
6. Go to **Settings** → **API** → copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret)

---

## Step 3 — Get OpenAI Key (2 min)

1. Go to platform.openai.com → **API Keys** → **Create new secret key**
2. Copy it. It starts with `sk-`
3. Add $10–20 credit to your account (more than enough for testing)

---

## Step 4 — Deploy to Vercel (3 min)

1. Go to vercel.com → **Add New Project** → Import from GitHub
2. Select your `lex-sovereign` repo
3. Click **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL        = your supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   = your supabase anon key
SUPABASE_SERVICE_ROLE_KEY       = your supabase service role key
OPENAI_API_KEY                  = your OpenAI key sk-...
NEXT_PUBLIC_APP_URL             = https://your-app.vercel.app
API_SECRET                      = any-random-string-you-make-up
```

4. Click **Deploy**
5. Wait 2 minutes. Your app is live.

---

## Step 5 — First Time Setup (3 min)

1. Visit `https://your-app.vercel.app/setup`
2. Click **"Seed Knowledge Base"** — loads 12 legal entries
3. Visit `/dashboard`
4. Ask the AI: *"What are my rights when a debt collector calls me?"*
5. You should get a streaming response backed by real FDCPA statutes

---

## Step 6 — Install on Your Phone

1. Open Safari (iPhone) or Chrome (Android)
2. Go to your Vercel URL
3. iPhone: Share → Add to Home Screen
4. Android: Menu → Add to Home Screen / Install App

See `MOBILE_INSTALL.md` for detailed instructions.

---

## First 24 Hours After Launch

1. Test every page yourself — Dashboard, Emails, Knowledge, Approvals
2. Add a real letter you've received to Emails (manual entry — no Gmail needed)
3. Click "Draft Reply" and review the AI-generated response
4. Edit it, approve it, see the audit log entry
5. Take a screen recording of this for your marketing content

**That screen recording is your first marketing asset.** Post it everywhere.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| White page / 500 error | Check Vercel logs for missing env vars |
| "pgvector not found" | Enable vector extension in Supabase → Extensions |
| AI returns no knowledge base results | Run the seed endpoint at /setup first |
| Gmail sync fails | Gmail is optional — use manual email entry instead |
| Slow first load | Normal on Vercel free tier — cold start. Goes away after first visit. |

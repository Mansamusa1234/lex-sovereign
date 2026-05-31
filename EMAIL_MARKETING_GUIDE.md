# Lex Sovereign — Email Marketing System Guide

## Setup (10 minutes)

### 1. Get Resend Account (Free — 3,000 emails/month)

1. Go to **resend.com** → Sign up free
2. Click **API Keys** → **Create API Key** → Copy it
3. Add to Vercel: `RESEND_API_KEY = re_...`

### 2. Verify Your Email Domain (Optional but Recommended)

For professional sending (not @gmail.com):
1. In Resend → **Domains** → **Add Domain**
2. Follow DNS instructions for your domain
3. Update `EMAIL_FROM` in Vercel to: `Lex Sovereign <hello@yourdomain.com>`

If you don't have a domain yet, Resend lets you send from `onboarding@resend.dev` for testing.

### 3. Run Database Migration

Go to Supabase → SQL Editor → paste and run `supabase/migrations/005_subscribers.sql`

---

## Collecting Subscribers

### The email capture form is already on your landing page.

When someone fills in their email at `lex-sovereign-f6m4.vercel.app`, they:
1. Get added to your `subscribers` table in Supabase
2. Receive an automatic welcome email
3. Can unsubscribe via link in every email

You can also manually add subscribers in Supabase → Table Editor → subscribers.

---

## Sending Marketing Emails

Use the `/api/email/send` endpoint (protected by your `API_SECRET`).

### Send a Campaign

```bash
curl -X POST https://lex-sovereign-f6m4.vercel.app/api/email/send \
  -H "x-api-key: YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "marketing",
    "subject_line": "Debt collector just called you? Here is what to do.",
    "headline": "Your Rights When a Debt Collector Calls",
    "body": "Most people do not know that under the FDCPA, debt collectors cannot call before 8am or after 9pm. They cannot use abusive language. And you can STOP them calling permanently with one written letter.",
    "cta_text": "Draft My Cease & Desist Letter →",
    "cta_url": "https://lex-sovereign-f6m4.vercel.app/dashboard",
    "tip_title": "Quick Legal Fact",
    "tip_content": "Under FDCPA 15 U.S.C. § 1692c(c), sending a written cease and desist requires collectors to stop ALL contact — except to confirm they are stopping or to notify you of legal action."
  }'
```

### Send a Newsletter

```bash
curl -X POST https://lex-sovereign-f6m4.vercel.app/api/email/send \
  -H "x-api-key: YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "newsletter",
    "week_number": 1,
    "law_of_the_week": {
      "title": "FDCPA Section 809 — Your Right to Demand Debt Validation",
      "content": "Within 5 days of first contact, a debt collector must send you a written notice with the debt amount, creditor name, and your right to dispute. If you dispute in writing within 30 days, collection must stop until they verify.",
      "source": "15 U.S.C. § 1692g"
    },
    "tip": "Always send dispute letters via Certified Mail with Return Receipt. This creates a legal record that the collector received your dispute. Use the Lex Sovereign AI Brain to draft the perfect letter."
  }'
```

### Filter by Tags

```bash
# Send only to people who signed up from TikTok
-d '{ ..., "filter": { "tags": ["tiktok"] } }'

# Send only to the first 100 subscribers
-d '{ ..., "filter": { "limit": 100 } }'
```

---

## Email Templates Included

| Template | Use Case |
|---|---|
| Welcome | Auto-sent when someone subscribes |
| Marketing | One-off campaigns with headline, body, CTA |
| Newsletter | Weekly legal rights update with law of the week |
| Custom | Send your own HTML (use {{name}} and {{email}} placeholders) |

---

## View Your Subscribers

Go to **Supabase → Table Editor → subscribers**

You'll see:
- Email address
- Name
- Source (where they signed up)
- Subscribed date
- Whether they've unsubscribed

---

## Weekly Email Calendar

| Week | Subject | Type |
|---|---|---|
| 1 | "What debt collectors CAN'T legally do" | Newsletter |
| 2 | "I put a collector letter into the AI — here's what it drafted" | Marketing |
| 3 | "Your FCRA rights: how to dispute credit errors" | Newsletter |
| 4 | "UCC 1-308 — what 'without prejudice' actually means" | Marketing |
| 5 | "The 5 FDCPA violations that pay you money" | Newsletter |

---

## GDPR / Data Protection Notes

- Every email contains a one-click unsubscribe link
- Subscribers are stored in your own Supabase database (UK/EU data stays in your region)
- You own your subscriber list entirely
- Add a privacy policy to your site linking to `lexsovereign.app/privacy`

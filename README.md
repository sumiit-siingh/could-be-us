# Seen™

Funny interactive “left on seen” quiz. Answers save to a database so you can view them on `/admin` — no WhatsApp needed.

## Local (works without Supabase)

```bash
cd dont-be-mad
cp .env.example .env.local
# Set at least:
# ADMIN_SECRET=any-password-you-want
npm install
npm run dev
```

- Quiz: http://localhost:3001 (or 3000)
- Admin: http://localhost:3001/admin → enter `ADMIN_SECRET`

Without Supabase, answers save to `data/submissions.json` on your machine.

## Free hosting (Vercel + free Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor**, paste and run `supabase-schema.sql`
3. Project **Settings → API**: copy **Project URL** + **service_role** key
4. Deploy to [vercel.com](https://vercel.com) (import this folder)
5. In Vercel → Project → Settings → Environment Variables:

```
ADMIN_SECRET=your-strong-password
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

6. Redeploy. Share the site URL with her. Open `yoursite.com/admin` to read every response.

## What gets saved

Every answer is stored as she picks it, including:

- roast options
- **Others** typed answers
- **soft / positive** catches + her “why shouldn’t I do the same” reason
- final “Should I do the same?” answer

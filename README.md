# SpendLens — AI Cost Auditor

> Find out exactly how much your company wastes on AI tools — and where to reinvest the savings.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| AI Summary | Anthropic Claude API |
| Email | Resend |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Testing | Vitest |
| Deployment | Vercel |

---

## Setup (7 steps)

### 1. Clone & install
```bash
git clone <your-repo>
cd spendlens
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Copy your Project URL and anon key from **Settings → API**

### 3. Set up Anthropic API
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 4. Set up Resend
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain

### 5. Configure environment variables
```bash
cp .env.local.example .env.local
```
Fill in all values in `.env.local`.

### 6. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel
```bash
npx vercel
```
Add all env vars in Vercel dashboard under **Settings → Environment Variables**.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── audit/page.tsx        # Audit form
│   ├── results/page.tsx      # Results + smart recs
│   ├── report/[slug]/        # Public shareable report
│   └── api/
│       ├── audit/route.ts    # POST — run audit
│       └── report/[slug]/    # GET — fetch report
├── components/
│   └── ComboBox.tsx          # Reusable searchable dropdown
├── lib/
│   ├── audit.ts              # Core calculation engine
│   ├── claude.ts             # AI summary generator
│   ├── email.ts              # Resend email sender
│   ├── schemas.ts            # Zod validation
│   ├── supabase.ts           # Supabase clients
│   └── toolData.ts           # Static tool/plan/usecase data
└── types/index.ts            # All TypeScript types
__tests__/
└── audit.test.ts             # 8 Vitest tests
```

---

## Running Tests
```bash
npm run test
```
8 tests covering:
- Waste calculation
- Unused seat detection
- Annual savings formula
- Utilisation cap
- Overlap detection
- Reinvestment suggestions
- Verdict logic (all 3 outcomes)
- INR formatter

---

## Abuse Protection
- **Honeypot field** on the form (bots fill it, humans don't)
- Zod validation on all inputs server-side
- Service role key never exposed to client

---

## App Flow
```
Landing → Audit Form → POST /api/audit → Results → Share
                              ↓
                       Supabase (store)
                       Claude API (summary)
                       Resend (email)
                              ↓
                    /report/[slug] (public)
```

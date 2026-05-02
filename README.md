# GameNest Designs

Boutique board game inserts and accessories — custom e-commerce platform.

## Stack

- **Frontend:** Vite + React 19 + TailwindCSS v4 (Fraunces serif + Inter)
- **Backend:** Express + tRPC + Drizzle ORM
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe Checkout
- **Storage:** Supabase Storage (product images)
- **Email:** Resend
- **Deploy:** Railway

---

## SQL to run first (Supabase)

Go to your Supabase project → SQL Editor → New query, then run each file in order:

| File | What it does |
|------|-------------|
| `sql/001_schema.sql` | Creates all tables, enums, indexes, and the storage bucket |
| `sql/002_seed_categories.sql` | Inserts the 4 default product categories |
| `sql/003_seed_sample_products.sql` | *(Optional)* Inserts 4 sample products |

---

## Environment variables

Copy `.env.example` to `.env` (local) or paste into Railway → Variables panel.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres connection string (direct, not pooler) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `SUPABASE_STORAGE_BUCKET` | Bucket name — `products` (created by SQL) |
| `JWT_SECRET` | Random 32+ char secret for session tokens |
| `INITIAL_ADMIN_EMAIL` | Email for the first admin account |
| `INITIAL_ADMIN_PASSWORD` | Password for the first admin account |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` or `sk_test_…`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | Sender name/address (e.g. `GameNest Designs <orders@yourdomain.com>`) |
| `OWNER_NOTIFICATION_EMAIL` | Where to send new-order alerts |
| `APP_URL` | Public URL of the deployed app (Railway gives this) |
| `PORT` | Port (Railway sets automatically) |
| `NODE_ENV` | `production` on Railway |

---

## Local development

```bash
# 1. Install deps
npm install          # or: pnpm install

# 2. Create .env from example
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD at minimum.
# Stripe and email can be left as placeholders for local testing.

# 3. Start dev server
npm run dev
# Opens on http://localhost:3000
```

---

## Deploying to Railway

1. Push this repo to GitHub.
2. In Railway → New Project → Deploy from GitHub → select the repo.
3. Add all environment variables from `.env.example`.
4. Railway auto-detects the Node.js project and runs `npm run build` then `npm run start`.
5. Set up a Stripe webhook pointing to `https://your-app.up.railway.app/api/stripe/webhook` — listen for `checkout.session.completed`.

---

## Admin access

Navigate to `/admin`. The account created from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` is automatically elevated to admin on first server start.

To add more admins: Admin → Team → Invite a new admin (or promote an existing customer).

---

## Adding products

Admin → Products → "+ New product". Fill in name, slug, description, price (in cents), category, inventory, and upload or paste an image URL.

To take a product down: click **Hide** — it stays in the database but disappears from the storefront.

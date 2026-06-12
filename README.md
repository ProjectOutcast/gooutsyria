# Go Out Syria — دليل المطاعم والكافيهات في سوريا

The first restaurant discovery platform for Syria. Fully Arabic (RTL), mobile-first,
built for low-bandwidth connections, launching with Damascus.

**Stack:** Next.js 16 (App Router, Turbopack) · PostgreSQL · Prisma 7 · Tailwind CSS 4 · Auth.js v5 · MapLibre GL + OpenStreetMap

## What's included (Phase 1)

**Public site (Arabic, RTL)**
- Home: search, cuisine grid, featured (sponsored) restaurants, collections, live offers
- Search with filters: cuisine, neighborhood, price band, open-now, features, sorting
- Restaurant pages: full menu with prices, photos, verified badge, reviews + owner replies,
  opening hours (Damascus timezone aware), lazy-loaded OSM map, tracked call/WhatsApp/directions buttons
- SEO landing pages per cuisine and per neighborhood ("أفضل مطاعم X في دمشق")
- Editorial collections ("قوائم مختارة") with sponsor support
- Offers feed
- JSON-LD (Restaurant, AggregateRating, ItemList), dynamic sitemap, robots, canonical URLs,
  transliterated Latin slugs (better Arabic SEO shareability)

**Owner portal (`/dashboard`)**
- Submit a new restaurant or claim an existing listing (manual verification flow)
- Edit profile, hours, cuisines, features, location
- Menu editor (sections + items + prices + "most ordered" flags)
- Photo uploads (auto re-encoded to WebP ≤1600px for low-bandwidth users)
- Offers (FREE tier: 1 active offer; PRO: unlimited — the upsell gate)
- Reply to reviews
- Analytics: page views, calls, WhatsApp clicks, direction clicks + 14-day daily breakdown

**Admin panel (`/admin`)**
- Listing approval queue, claim approval (ownership transfer), review moderation
- Featured placements (HOME / SEARCH / CUISINE slots with date ranges) — sold manually, labeled مُموَّل
- Brand sponsor slots (home banner, collection sponsorship)
- Verified badge + PRO tier toggles
- Collections editor, taxonomy (cuisines/features/neighborhoods), user roles

**Monetization built in** (see `docs/research/competitive-analysis.md` for the full strategy):
featured placements, verified/enhanced badges, PRO tier gating, brand sponsor slots.
All sold direct / collected offline (cash-first market) — no payment processing required at launch.

## Local development

```bash
# 1. Postgres (Docker) — or use any local Postgres
docker compose up -d db

# 2. Configure
cp .env.example .env   # set DATABASE_URL + AUTH_SECRET

# 3. Install, migrate, seed
npm install
npx prisma migrate dev
npm run db:seed

# 4. Run
npm run dev
```

**Demo accounts** (after seeding):

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@gooutsyria.com   | Admin1234! |
| Owner | owner@gooutsyria.com   | Owner1234! |
| User  | user@gooutsyria.com    | User1234!  |

> Seed data (restaurants, reviews, photos) is fictional demo content — replace before launch.

## Deploying to Railway

1. Create a Railway project → **Deploy from GitHub repo** (this repo). The included
   `Dockerfile` + `railway.json` are picked up automatically; migrations run on boot.
2. Add a **PostgreSQL** service. On the app service set:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET` = output of `openssl rand -base64 32`
   - `AUTH_TRUST_HOST` = `true`
   - `NEXT_PUBLIC_SITE_URL` = your public URL (e.g. `https://gooutsyria.com`)
3. **Photo uploads:** add a Volume mounted at `/data` and set `UPLOAD_DIR=/data/uploads`.
4. (Optional) Google sign-in: set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   (authorized redirect: `https://<domain>/api/auth/callback/google`).
5. Seed demo data once (optional) — from your **local machine**, pointing at the
   Railway database's public URL (Postgres service → Connect → Public Network):
   ```bash
   DATABASE_URL="<railway-public-postgres-url>" npm run db:seed
   ```
   Or skip seeding and add real restaurants through `/admin`.

### Troubleshooting a failed deploy

- **Healthcheck fails / app never responds**: open the service's **Deploy Logs**
  (not Build Logs). The start command runs `prisma migrate deploy` first — if
  `DATABASE_URL` is missing or wrong, it exits before the server starts.
- `/api/health` returns `503`: server is up but can't reach the database —
  check the `DATABASE_URL` reference variable.
- Auth errors (500) on login: `AUTH_SECRET` is not set.

## Performance notes (Syria-specific)

Median connection in Syria is ~3 Mbps with expensive metered data, so:
- Server-rendered pages, no heavy client bundles on public routes
- MapLibre (~200KB) loads **only when the user taps the map**
- Uploads re-encoded to WebP; `next/image` serves AVIF/WebP with responsive sizes
- Arabic font (IBM Plex Sans Arabic) self-hosted via Fontsource — no Google Fonts dependency
  (Google services were historically geo-blocked in Syria)
- OSM tiles instead of Google Maps (Google Maps data/editing remains restricted for Syria)

## Roadmap

- **Phase 2:** owner analytics v2, saved lists, review photos, helpfulness votes,
  invoicing records for placements, Arabic transactional email/SMS abstraction
- **Phase 3:** more cities (Aleppo, Homs, Latakia…), consumer deals program
  (capped/off-peak — Entertainer model), local payment rails (Paymera/ecash) for
  self-serve billing, PWA/mobile apps, delivery-partner integration

## Project docs

- `docs/research/competitive-analysis.md` — full competitive analysis (Zomato, Yelp,
  elmenus, Jeeran, The Entertainer…), ranked monetization strategy for the Syrian
  market, and Syria-specific technical constraints (payments, maps, SMS, hosting).

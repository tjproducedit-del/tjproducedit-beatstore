# VOIDBEATS - Beat Selling Platform

A production-ready beat selling website built with Next.js 14, Tailwind CSS, Stripe, PayPal, and Cloudinary.

## Architecture

```
beatstore/
├── app/
│   ├── api/
│   │   ├── admin/          # Protected admin endpoints
│   │   │   ├── auth/       # JWT login/logout
│   │   │   ├── beats/      # CRUD operations
│   │   │   ├── orders/     # Order listing
│   │   │   └── upload/     # Cloudinary file upload
│   │   ├── beats/          # Public beat listing
│   │   ├── checkout/       # Order creation + payment init
│   │   ├── download/[token]/ # Secure token-gated downloads
│   │   └── webhooks/stripe/  # Payment verification
│   ├── admin/              # Admin dashboard UI
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout with Stripe Elements + PayPal
│   ├── download/[token]/   # Customer download page
│   ├── success/            # Post-purchase confirmation
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Tailwind + custom styles
│   └── page.tsx            # Homepage (hero + beat grid + licenses)
├── components/
│   ├── player/
│   │   └── GlobalPlayer.tsx  # Sticky audio player bar
│   ├── BeatCard.tsx          # Beat card with play/cart actions
│   ├── BeatGrid.tsx          # Responsive beat grid
│   ├── Header.tsx            # Navigation with cart badge
│   ├── Footer.tsx            # Footer with socials
│   ├── LicenseModal.tsx      # License tier selection
│   └── SearchFilter.tsx      # Search + genre filter
├── hooks/
│   ├── use-cart.ts           # Zustand cart store (persisted)
│   └── use-player.ts        # Zustand audio player store
├── lib/
│   ├── auth.ts               # JWT session management (jose + bcrypt)
│   ├── cloudinary.ts         # Upload + signed URL generation
│   ├── db.ts                 # Prisma client singleton
│   ├── email.ts              # Nodemailer purchase email
│   ├── license.ts            # License PDF generator
│   ├── paypal.ts             # PayPal REST API client
│   ├── rate-limit.ts         # In-memory rate limiter
│   └── stripe.ts             # Stripe SDK + payment intents
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.ts               # Demo data seeder
├── types/
│   └── index.ts              # TypeScript types + license config
├── middleware.ts              # Admin route protection
├── .env.example              # Environment variable template
├── next.config.js            # Security headers + CSP
├── tailwind.config.ts        # Dark theme + custom design tokens
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in all values in `.env`. You need accounts for:

- **PostgreSQL** database (Supabase, Neon, Railway, or local)
- **Stripe** account with API keys and webhook secret
- **PayPal** developer account with REST API credentials
- **Cloudinary** account for file storage
- **SMTP** provider (Gmail App Password, Resend, SendGrid, etc.)

### 3. Generate admin password hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
```

Add the output to `ADMIN_PASSWORD_HASH` in `.env`.

### 4. Set up database

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed demo data (optional)

```bash
npm run db:seed
```

### 6. Set up Stripe webhooks

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production, configure the webhook endpoint in your Stripe Dashboard to point to:
```
https://yourdomain.com/api/webhooks/stripe
```

Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 7. Run

```bash
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

## Payment Flow

1. Customer adds beats to cart, selects license tier
2. At checkout, enters email and chooses Stripe or PayPal
3. **Stripe path**: Payment Intent created server-side, client confirms with Stripe Elements (supports Apple Pay, Google Pay, cards)
4. **PayPal path**: Order created via PayPal REST API, captured on approval
5. Stripe webhook (or PayPal capture callback) triggers fulfillment
6. Fulfillment: order marked complete, license PDF generated, email sent with unique download token
7. Customer clicks download link, token verified, signed Cloudinary URLs returned

## Security

- All file URLs (MP3, WAV) are Cloudinary authenticated resources, never exposed publicly
- Download tokens are unique CUIDs with 7-day expiry and 5-download limit
- Stripe webhook signatures verified server-side
- Admin routes protected by JWT session cookies (httpOnly, secure, sameSite)
- Rate limiting on all API routes (100 req/15min general, 5 req/15min auth, 10 req/hr downloads)
- CSP headers configured in next.config.js
- HSTS, X-Frame-Options, X-Content-Type-Options headers set
- Server-side price validation (client prices are never trusted)
- Passwords hashed with bcrypt (12 rounds)

## Deployment

Recommended: **Vercel** (Next.js native) + **Supabase** (PostgreSQL)

1. Push to GitHub
2. Import in Vercel, add all environment variables
3. Vercel auto-deploys with `next build`
4. Configure Stripe webhook endpoint to production URL
5. Configure PayPal webhook endpoint
6. Set `PAYPAL_MODE=live` for production

## Customization

- **Branding**: Update logo/name in `Header.tsx`, `Footer.tsx`, and `layout.tsx`
- **Colors**: Edit `tailwind.config.ts` accent/surface colors
- **License terms**: Edit `lib/license.ts`
- **Pricing tiers**: Edit `types/index.ts` LICENSE_OPTIONS and price multipliers in `LicenseModal.tsx` and `app/api/checkout/route.ts`
- **Email template**: Edit `lib/email.ts`

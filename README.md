# StackLink Frontend

React + Vite frontend untuk StackLink, aplikasi link-in-bio full-stack dengan profile builder, public profile, SEO publishing, analytics, admin dashboard, billing UI, dan rich content blocks.

## Fitur

- Login, register, email verification, forgot password, dan protected routes.
- Dashboard, profile settings, links, insights, publishing, billing, dan admin page.
- Live preview public profile.
- Theme gallery, font, background image, custom color, dan avatar upload.
- Link dan rich content blocks: link, YouTube, Spotify, social, heading, divider, contact, donation.
- SEO preview dan Netlify Edge Function untuk crawler-visible metadata.
- Tracking consent untuk Google Analytics, Meta Pixel, dan TikTok Pixel.
- Analytics dashboard dengan custom date range, CSV export, realtime update, country, browser, OS, referrer, dan device split.
- Playwright E2E dan Vitest unit tests.

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Supabase client optional untuk realtime analytics
- Sentry React optional
- Vitest
- Playwright

## Setup Lokal

```bash
npm install
cp .env.example .env
npm run dev
```

Untuk development lokal, kosongkan `VITE_API_BASE_URL` dan arahkan proxy ke backend lokal:

```env
VITE_API_BASE_URL=
VITE_DEV_PROXY_TARGET=http://127.0.0.1:5000
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
API_BASE_URL=http://127.0.0.1:5000
```

Frontend berjalan di:

```txt
http://localhost:5173
```

## Environment Variables

| Variable | Fungsi |
| --- | --- |
| `VITE_API_BASE_URL` | URL backend production. Kosongkan untuk memakai Vite proxy lokal. |
| `VITE_DEV_PROXY_TARGET` | Target proxy lokal untuk `/api` dan `/u`. |
| `VITE_SENTRY_DSN` | DSN Sentry frontend. |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | Sampling tracing Sentry frontend. |
| `API_BASE_URL` | URL backend untuk Netlify Edge Function SEO. |
| `VITE_SUPABASE_URL` | Supabase URL untuk realtime analytics optional. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase optional. |

## Script

```bash
npm run dev
npm run build
npm run lint
npm test
npm run test:e2e
npm run preview
```

## Deployment Netlify

Build command:

```bash
npm run build
```

Publish directory:

```txt
dist
```

Set environment production:

```env
VITE_API_BASE_URL=https://your-backend-domain
API_BASE_URL=https://your-backend-domain
```

`netlify.toml` sudah mengatur SPA redirect dan Edge Function `profile-seo`.

## Testing

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

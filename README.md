# Primo Diamond Selector API

Express microservice that powers the Primo Diamonds **Diamond Selector** on the Shopify theme. Proxies diamond search/filter requests to a pluggable provider (`mock` for development, `nivoda` when configured).

**Shopify theme repo:** [primodiamonds-website](../primodiamonds-website) — set **Theme settings › Primo · Product page › Diamond selector API base URL** to this service’s public URL (no trailing slash).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + active provider |
| GET | `/api/diamonds/filters` | Available filter definitions |
| GET | `/api/diamonds/search` | Search with query params (shape, carat, price, etc.) |
| GET | `/api/diamonds/:id` | Single diamond by ID |

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Default: `http://127.0.0.1:8787`

Test:

```bash
curl http://127.0.0.1:8787/health
curl "http://127.0.0.1:8787/api/diamonds/search?limit=2"
```

## Deploy to Vercel

1. Push this repo to GitHub (or connect directly in Vercel).
2. Import project in Vercel — framework preset: **Other** (Express detected via `src/app.js`).
3. Set environment variables in Vercel (same keys as `.env.example`).
4. Add your **production Vercel URL** and Shopify storefront URL to `CORS_ORIGINS` (comma-separated).
5. Copy the deployment URL into the Shopify theme setting `primo_diamond_selector_api_url`.

Example CORS for production:

```text
CORS_ORIGINS=https://your-api.vercel.app,https://www.primodiamonds.co.uk,https://primo-dev-p0bmd3ue.myshopify.com
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DIAMOND_PROVIDER` | No | `mock` (default) or `nivoda` |
| `CORS_ORIGINS` | Yes (production) | Comma-separated allowed browser origins |
| `NIVODA_API_URL` | For Nivoda | API base URL |
| `NIVODA_CLIENT_ID` / `NIVODA_CLIENT_SECRET` | For Nivoda | OAuth credentials (if applicable) |
| `NIVODA_API_KEY` | For Nivoda | API key (if applicable) |
| `DIAMOND_CACHE_TTL` | No | Cache TTL in seconds (default 60) |

Do **not** commit `.env` or real credentials.

## Nivoda

The Nivoda provider is a **stub** until official API documentation and credentials are available. Do not invent endpoints or auth methods.

## Architecture

```text
Shopify theme (primo-diamond-selector.js)
        ↓  fetch (public URL only)
Primo Diamond Selector API (this repo)
        ↓
mock-provider | nivoda-provider
```

Selected diamonds are stored as **Shopify line item properties** on add to cart (handled in the theme, not this API).

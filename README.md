# AI Homeless Navigator

Helping people find hope, resources, and their next step.

A React + Vite web app with a serverless API route that powers the in-app AI assistant.

## What's included

- `src/App.jsx` — the full app: sticky emergency bar, AI chat, resource finder, guides, and a saved-list/checklist dashboard (persisted in the browser via `localStorage`)
- `api/chat.js` — a Vercel serverless function that calls the Anthropic API using a server-side key, so the key is never exposed to the browser
- Sample/mock resource listings — **not live data**. Replace `MOCK_RESOURCES` in `src/App.jsx` with a real database or resource API before using this for real users.

## Run it locally

```bash
npm install
```

Create a `.env.local` file (copy `.env.example`) and add your real Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at https://console.anthropic.com/

```bash
npm run dev
```

Note: `npm run dev` only serves the frontend. To test the `/api/chat` function locally you'll want the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm install -g vercel
vercel dev
```

## Deploy to Vercel (recommended)

1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com, click **Add New → Project**, and import the repo. Vercel auto-detects Vite and the `api/` folder.
3. Before deploying, go to **Project Settings → Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your real key
4. Deploy. You'll get a live URL like `ai-homeless-navigator.vercel.app`.
5. To use your own domain: **Project Settings → Domains**, add your domain, then create the CNAME/A record it gives you at your registrar (e.g. Hostinger).

## Deploy to Netlify instead

This project also ships with a Netlify-ready setup — `netlify/functions/chat.js` and `netlify.toml` are already included, so you don't need to touch the frontend code.

1. Push this folder to a GitHub repository (same as the Vercel steps above).
2. Go to https://app.netlify.com, click **Add new site → Import an existing project**, and connect the repo. Netlify will read `netlify.toml` automatically (build command `npm run build`, publish folder `dist`, functions in `netlify/functions`).
3. Before deploying, go to **Site configuration → Environment variables** and add:
   - `ANTHROPIC_API_KEY` = your real key
4. Deploy. You'll get a live URL like `ai-homeless-navigator.netlify.app`.
5. Custom domain: **Domain management → Add a domain**, then add the DNS record Netlify gives you at your registrar (e.g. Hostinger).

Note: `netlify.toml` includes a redirect from `/api/chat` to `/.netlify/functions/chat`, so the same `src/App.jsx` works on both Vercel and Netlify without any changes. If you deploy to Vercel, the extra `netlify.toml` / `netlify/functions` files are simply ignored.

## Before this goes live for real users

- [ ] Replace mock resource data with a real, regularly-verified data source (a database, a partner API, or an admin CMS)
- [ ] Add real geocoding/location search (e.g. Google Places API) — currently the ZIP/city field is cosmetic
- [ ] Add a rate limit to `/api/chat` to control API costs (e.g. via Vercel's built-in rate limiting or a simple IP-based counter)
- [ ] Review and harden the crisis-detection language in the system prompt with input from a mental health professional
- [ ] Add analytics/monitoring appropriate for a vulnerable user base, with strong privacy protections

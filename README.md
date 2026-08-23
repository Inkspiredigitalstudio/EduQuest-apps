# EduQuest

Platform Hub Soalan Peperiksaan Interaktif (SPPIM Quest, PKSK, UKKM, PSRA & UASA) — Belajar, Bermain & Cemerlang.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — your Supabase project credentials.
   - `ANTHROPIC_API_KEY` — only needed to run the AI Writing Coach (`api/articulation-ai.ts`) locally via `vercel dev`; plain `npm run dev` doesn't serve `/api` routes.
3. Run the app:
   `npm run dev`

## Deployment

The app deploys as a static site (Vercel/Netlify) with one Vercel serverless function (`api/articulation-ai.ts`) proxying Claude API calls for the PKSK Artikulasi Karangan AI Coach — this keeps `ANTHROPIC_API_KEY` server-side only. Set that variable in your Vercel project's Environment Variables (not prefixed with `VITE_`, so it's never bundled into client code).

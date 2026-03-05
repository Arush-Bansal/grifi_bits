# Orbit UGC Studio

Next.js + Supabase starter for AI-assisted UGC and ad creation.

## Stack
- Next.js (App Router, TypeScript)
- Tailwind + shadcn-style utility components
- Supabase backend route for project persistence

## Setup
1. Install dependencies:
   npm install
2. Configure env vars in `.env.local`:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
3. Run:
   npm run dev

## Flow
- `/` home with Start button
- `/create` 4 steps:
  - product setup + image upload
  - reference selection (girl/box/brand/lifestyle)
  - scrollable scene mesh editor (8 columns)
  - final portrait video preview + captions/music controls

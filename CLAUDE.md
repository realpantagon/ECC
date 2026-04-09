# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Vite frontend dev server (port 5173)
pnpm dev:worker       # Start Hono API worker via wrangler (port 8787)
pnpm build            # Type-check (tsc -b) then Vite build → dist/
pnpm deploy           # Build then wrangler deploy to Cloudflare
pnpm lint             # Run ESLint
```

During local development, both servers must run concurrently. Set `VITE_API_BASE_URL=http://127.0.0.1:8787` in `.env` so the frontend hits the local worker instead of the deployed URL.

The worker needs `DATABASE_URL` set as a Wrangler secret (`wrangler secret put DATABASE_URL`).

## Architecture Overview

This is a **buddy-session scheduling app** (ATS ECC) with two separate TypeScript compilation targets sharing one repository:

### Frontend (`src/`) — React 19 + Vite + Tailwind CSS v4
- **Pages** (`src/pages/`): `LoginPage`, `AdminDashboard`, `BuddyDashboard`, `ParticipantDashboard`
- **Features** (`src/features/{admin,buddy,participant}/`): Role-specific components and hooks, co-located by role
- **Contexts** (`src/contexts/`):
  - `AuthContext` — user session stored in `localStorage`, login/logout via API
  - `DataContext` — single `/api/bootstrap` fetch on mount loads all app state; mutations call individual API endpoints and update state optimistically, then re-fetch on complex operations (e.g., `createMeeting`, `completeMeeting`)
- **API client** (`src/lib/api-client.ts`): Uses Hono's RPC client (`hc<AppType>`) for fully type-safe API calls. The type `AppType` is exported from `src-worker/index.ts`. `unwrapJson<T>()` handles error unwrapping.
- **UI** (`src/components/ui/`): shadcn/ui primitives. `src/shared/components/` contains shared app-level components.

### Backend (`src-worker/index.ts`) — Hono on Cloudflare Workers
Single-file API. All routes, Zod schemas, and DB row types live here. Key points:
- Uses `@neondatabase/serverless` (`neon` tagged template) for PostgreSQL queries
- Input validated with `zValidator` + Zod before every mutating route
- CORS controlled by `FRONTEND_ORIGIN` env var (comma-separated origins, supports `*` wildcards)
- A Cron trigger runs every 4 minutes (`*/4 * * * *`) to keep the Neon DB warm
- `ASSETS` binding serves the built frontend SPA; the `notFound` handler falls through to it for client-side routing

### Deployment
The worker serves both the API (`/api/*`) and the static frontend assets from the `dist/` directory via the `ASSETS` binding. A single `wrangler deploy` ships everything together.

### Database Schema
PostgreSQL (Neon) with these tables: `users`, `availabilities`, `slot_requests`, `meetings`, `meeting_participants`, `session_logs`. See `supabase_schema.sql` for the DDL. Key enums: `user_role` (`admin | buddy | participant`), `meeting_status` (`scheduled | completed | canceled`).

### User Roles
- **Buddy**: Creates availability slots; views their own schedule
- **Participant**: Requests slots with a topic; limited to 3 bookings per ISO week
- **Admin**: Converts slot requests into meetings; can view all dashboards via `?view=admin|buddy|participant` query param; manages session reports and statistics

### tsconfig layout
- `tsconfig.app.json` — frontend (targets browser)
- `tsconfig.worker.json` — Cloudflare Worker (targets `webworker`)
- `tsconfig.node.json` — Vite config compilation

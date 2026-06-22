# Tipster Arena

Virtual sports tipster betting competition platform — React frontend.

## Stack

- React 19, TypeScript, Vite
- Tailwind CSS 4, Framer Motion, Recharts
- TanStack Query, Zustand, Axios, MSW
- React Router, React Hook Form, Zod

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo login:** `demoplayer@example.com` / any password (6+ chars)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with MSW mocks |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Environment

Copy `.env.example` to `.env`:

- `VITE_API_URL` — API base path (`/api` for MSW mocks on the Vite dev server)
- `VITE_ENABLE_MSW` — `true` enables mock API (required without backend)

## MSW (mock API)

API calls are mocked by **Vite dev-server middleware** in `vite.config.ts` (not a browser Service Worker). This avoids `mockServiceWorker.js` passthrough errors when no backend is running.

Ensure `.env` has `VITE_ENABLE_MSW=true` and `VITE_API_URL=/api`.

If you previously used the browser worker, clear stale registrations once:
DevTools → Application → Service Workers → Unregister (the app also unregisters on load).

Handlers live in `src/mocks/handlers/`. `public/mockServiceWorker.js` is optional legacy; run `npm run msw:init` only if you switch back to browser MSW.


## Documentation

See [`docs/`](docs/) for architecture, routing, design system, API contract, and roadmap.

## Features

- Auth (register, login, forgot/reset password)
- Dashboard, wallet, virtual credits
- Football fixtures with Malay, Handicap, Over/Under odds
- Bet slip, place/cancel bets with business rules
- Leaderboard, public transparency profiles
- Seasons & prizes, notifications, settings

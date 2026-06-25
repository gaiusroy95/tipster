# Betting Freelancer

Monorepo for the Sports Tipster virtual betting platform.

| Folder | Description |
|--------|-------------|
| [`frontend/`](frontend/) | Main React web application (port 5173) |
| [`admin/`](admin/) | Admin panel for users, leagues, seasons, moderation (port 5174) |
| [`backend/`](backend/) | Express API + Overtime sports proxy (port 3000) |
| `mobile/` | React Native app (planned) |

## Quick start (all apps)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run prisma:deploy
npm run start:dev
```

API: [http://localhost:3000](http://localhost:3000)

On startup the backend bootstraps an admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (promotes existing user or creates a verified admin).

### Main frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Admin panel

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) and sign in with the bootstrap admin credentials.

## Admin capabilities

- **Users** — search, ban/unban, role changes, balance adjustments, force email verify
- **Leagues** — sync soccer leagues from Overtime, enable/disable curated sidebar list
- **Seasons** — create seasons, activate season, prize tiers
- **Bets** — global read-only bet list with filters
- **Forum** — hide/delete posts
- **Audit log** — admin action history

Public curated leagues: `GET /api/leagues/curated?sportId=soccer` — when configured, the main app filters its league sidebar and match lists.

## Environment

See [`backend/.env.example`](backend/.env.example) for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_FRONTEND_URL` (CORS).

See [`admin/.env.example`](admin/.env.example) for `VITE_API_URL`.

Demo login (main app, MSW): `demoplayer@example.com` / any password (6+ chars) when `VITE_ENABLE_MSW=true`.

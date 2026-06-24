# Betting-Freelancer Backend

Express API: Overtime sports/odds proxy + PostgreSQL auth.

Default URL: `http://localhost:3000`

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Overtime API key (`X_API_KEY`)

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, X_API_KEY, SMTP settings
npm install
npm run prisma:generate
npm run prisma:migrate
```

### PostgreSQL

Create a database (example):

```sql
CREATE DATABASE betting_freelancer;
```

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/betting_freelancer
```

Run migrations:

```bash
npm run prisma:migrate
```

## Development

```bash
npm run start:dev
```

`prestart:dev` frees `PORT` before starting (avoids `EADDRINUSE`).

### Git Bash: port already in use

```bash
netstat -ano | grep :3000
taskkill //PID <pid> //F
```

Or: `npm run free-port`

## Production build

```bash
npm run build
npm run start:prod
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `3001` in code fallback, use `3000` in `.env`) |
| `X_API_KEY` | Yes | Overtime API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `FRONTEND_URL` | Yes | Base URL for password reset links (e.g. `http://localhost:5173`) |
| `MAIL_HOST` | Yes* | SMTP host for reset emails |
| `MAIL_PORT` | No | SMTP port (default `587`) |
| `MAIL_SECURE` | No | `true` for TLS-on-connect |
| `MAIL_USER` | Yes* | SMTP username |
| `MAIL_PASS` | Yes* | SMTP password |
| `MAIL_FROM` | No | From address (defaults to `MAIL_USER`) |
| `GOOGLE_CLIENT_ID` | Yes** | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes** | Google OAuth client secret |

\* Required for forgot-password email delivery.

\** Required for Google sign-in. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add authorized redirect URI: `http://localhost:5173/auth/callback` (match your frontend URL).

## API endpoints

### Health

- `GET /health`

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Sign up (email/password) |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/auth/oauth/google/url` | Start Google OAuth (`mode`, `redirectUri` query params) |
| POST | `/api/auth/oauth/google` | Complete Google sign-in / sign-up |
| POST | `/api/auth/oauth/google/link` | Link Google to existing account (Bearer) |
| DELETE | `/api/auth/oauth/google/unlink` | Unlink Google (Bearer) |
| GET | `/api/auth/linked-accounts` | List connected social accounts (Bearer) |

Responses use `{ data: ... }`. Errors use `{ code, message, details? }`.

### Sports (Overtime proxy)

- `GET /sports/sports`
- `GET /sports/market-types`
- `GET /sports/leagues`
- `GET /sports/networks/10/markets`
- `GET /sports/networks/10/markets/:gameId`
- `GET /sports/networks/10/live-markets`

## Frontend integration

With `VITE_ENABLE_MSW=true`, Vite proxies `/api/auth` to this server while other `/api/*` routes remain mocked.

Ensure `FRONTEND_URL` matches the frontend dev URL so reset links work.

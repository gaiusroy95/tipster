# Betting-Freelancer Backend

NestJS proxy for the Overtime sports/odds API. Default URL: `http://localhost:3000`.

## Setup

```bash
cd backend
cp .env.example .env   # if present; otherwise use existing .env
# Set X_API_KEY and PORT=3000 in .env
npm install
```

## Development

```bash
npm run start:dev
```

`prestart:dev` automatically frees `PORT` (from `.env`, default 3000) before each start, so a leftover process from a previous run does not cause `EADDRINUSE`.

If port 3000 is still blocked:

```bash
npm run free-port
npm run start:dev
```

### Git Bash: manual port cleanup

Git Bash treats `/PID` as a path. Use **double slashes**:

```bash
netstat -ano | grep :3000
taskkill //PID 24468 //F
```

Wrong (fails in Git Bash): `taskkill /PID 24468 /F`

### Avoid duplicate servers

- Run **one** `npm run start:dev` in a single terminal.
- Before starting again, stop the old process with `Ctrl+C` in that terminal.
- If you forget, `npm run start:dev` will try to free the port for you via `prestart:dev`.

## Endpoints

- `GET /health`
- `GET /sports/sports`
- `GET /sports/market-types`
- `GET /sports/leagues`
- `GET /sports/networks/10/markets`
- `GET /sports/networks/10/markets/:gameId`
- `GET /sports/networks/10/live-markets`

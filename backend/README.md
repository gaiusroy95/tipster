# Overtime.io V2 Sports API Backend

NestJS service that proxies and caches Overtime V2 sports data for the Tipster Arena frontend.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set X_API_KEY
npm install
npm run start:dev
```

Server runs at `http://localhost:3000` with routes under `/api/*`.

## Environment

| Variable | Description |
|----------|-------------|
| `X_API_KEY` | Overtime API key (`x-api-key` header) |
| `OVERTIME_BASE_URL` | Default `https://api.overtime.io/overtime-v2` |
| `OVERTIME_NETWORK_ID` | Default `10` (Optimism) |
| `POLL_MARKETS_INTERVAL` | Seconds between market polls (default 60) |
| `POLL_LIVE_INTERVAL` | Seconds between live polls (default 30) |

## REST endpoints (frontend)

All responses include `meta.cachedAt`, `meta.stale`, and hash fields where applicable.

### Sports metadata (24h cache)

```bash
curl http://localhost:3000/api/sports
```

### Market types (24h cache)

```bash
curl http://localhost:3000/api/market-types
```

### Leagues grouped by sport with open market counts

```bash
curl http://localhost:3000/api/leagues
```

### Open markets (hash polling, 60s refresh)

```bash
curl http://localhost:3000/api/markets
```

### Single game / market detail

```bash
curl "http://localhost:3000/api/markets/0x3430343338353400000000000000000000000000000000000000000000000000"
```

### Live in-play markets (30s refresh)

```bash
curl http://localhost:3000/api/live-markets
```

## Architecture

```
OvertimeApiClient  → fetchWithRetry + x-api-key
SportsService      → in-memory cache + background polling
SportsController   → /api/sports, /api/markets, ...
```

- **Hash caching**: stores `responseHash` from Overtime; sends it on the next poll. Never forwards `"no change"` to clients — serves full cached payload.
- **Stale fallback**: if Overtime is down, endpoints return last cached data with `meta.stale: true`.
- **Sport resolution**: `market.sport` or `allSports[subLeagueId].sport`
- **League name**: `market.leagueName` or `allSports[subLeagueId].label`

## Frontend integration

Point the frontend API client to `http://localhost:3000/api` and disable MSW for sports routes, or proxy `/api` from Vite to this backend.

```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_MSW=false
```

## Overtime docs

- https://docs.overtime.io/overtime-v2-integration.md
- https://docs.overtime.io/overtime-v2-integration/overtime-v2-markets-protected.md

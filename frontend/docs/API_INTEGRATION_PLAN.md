# API Integration Plan — Sports Tipster Platform

> REST API contract for frontend-backend integration. MSW handlers mirror these endpoints exactly during development.

## 1. Base Configuration

| Setting | Value |
|---------|-------|
| Base URL | `VITE_API_URL` → `http://localhost:3000/api` |
| Protocol | HTTPS in production; HTTP localhost in dev |
| Auth | `Authorization: Bearer <JWT>` |
| Content-Type | `application/json` |
| Timeout | 15 seconds (Axios) |

### Response Envelope

All successful responses:

```typescript
interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}
```

All error responses:

```typescript
interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, string[]>
}
```

Implemented in `src/core/types/api.ts` as `ApiError` class.

---

## 2. Authentication

### 2.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account + initial credits |
| POST | `/auth/login` | No | Returns JWT + user |
| POST | `/auth/logout` | Yes | Invalidate token (future) |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Reset with token |
| GET | `/auth/me` | Yes | Current user profile |

### 2.2 DTOs

```typescript
// Request
interface RegisterPayload {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface LoginPayload {
  email: string
  password: string
}

interface ForgotPasswordPayload {
  email: string
}

interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword: string
}

// Response
interface AuthResponse {
  token: string
  user: UserDto
}

interface UserDto {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  createdAt: string
}
```

### 2.3 MSW Handlers

**File:** `mocks/handlers/auth.handlers.ts`

| Handler | Mock behavior |
|---------|---------------|
| POST `/auth/register` | Create user in memory; return token; balance = 10,000 |
| POST `/auth/login` | Validate against seed users |
| GET `/auth/me` | Return user from token or 401 |
| POST `/auth/forgot-password` | Always 200 (no leak) |
| POST `/auth/reset-password` | Validate token from query |

---

## 3. Fixtures (Football MVP)

### 3.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/fixtures` | Yes | List matches with odds |
| GET | `/fixtures/:matchId` | Yes | Match detail + all markets |
| GET | `/leagues` | Yes | Available football leagues |

### 3.2 Query Parameters — `GET /fixtures`

| Param | Type | Description |
|-------|------|-------------|
| `leagueId` | string | Filter by league |
| `status` | `scheduled` \| `live` \| `finished` | Match status |
| `date` | ISO date | Filter by match date |
| `page` | number | Pagination (default 1) |
| `limit` | number | Page size (default 20) |

### 3.3 DTOs

```typescript
interface LeagueDto {
  id: string
  name: string
  country: string
  logoUrl: string | null
}

interface FixtureDto {
  id: string
  leagueId: string
  leagueName: string
  homeTeam: TeamDto
  awayTeam: TeamDto
  kickoffAt: string          // ISO 8601
  status: MatchStatus        // scheduled | live | finished | postponed
  homeScore: number | null
  awayScore: number | null
  markets: MarketSummaryDto[]
}

interface TeamDto {
  id: string
  name: string
  shortName: string
  logoUrl: string | null
}

interface MarketSummaryDto {
  type: MarketType           // malay | handicap | over_under
  selections: SelectionDto[]
}

interface SelectionDto {
  key: string                // unique identifier for bet placement
  label: string              // "Home", "Away", "Over 2.5"
  odds: number
  line?: number              // handicap line or O/U line
  suspended: boolean
}

interface FixtureDetailDto extends FixtureDto {
  venue: string | null
  round: string | null
  markets: MarketDetailDto[]
}

interface MarketDetailDto extends MarketSummaryDto {
  updatedAt: string
}
```

### 3.4 MSW Handlers

**File:** `mocks/handlers/fixtures.handlers.ts`

- Seed data: `mocks/data/fixtures.json` (Premier League, La Liga, Serie A samples)
- Live matches: 2–3 fixtures with `status: 'live'` and changing scores (static in MVP)
- Odds suspended: random selection flagged `suspended: true` for UI testing

---

## 4. Bets

### 4.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/bets/active` | Yes | Current user's active bets |
| GET | `/bets/history` | Yes | Settled/cancelled bets |
| GET | `/bets/:betId` | Yes | Single bet detail |
| POST | `/bets` | Yes | Place virtual bet |
| POST | `/bets/:betId/cancel` | Yes | Cancel active bet |
| GET | `/bets/daily-limit` | Yes | Big bet usage today |

### 4.2 Query Parameters — `GET /bets/history`

| Param | Type | Description |
|-------|------|-------------|
| `status` | BetStatus | Filter by result |
| `from` | ISO date | Start date |
| `to` | ISO date | End date |
| `page` | number | Pagination |
| `limit` | number | Page size |

### 4.3 DTOs

```typescript
interface PlaceBetPayload {
  matchId: string
  marketType: MarketType
  selectionKey: string
  odds: number
  stake: number
}

interface BetDto {
  id: string
  userId: string
  matchId: string
  matchLabel: string
  marketType: MarketType
  selectionKey: string
  selectionLabel: string
  odds: number
  stake: number
  potentialReturn: number
  status: BetStatus           // active | won | lost | cancelled | void
  placedAt: string
  settledAt: string | null
  profitLoss: number | null
  cancellationPenalty: number | null
}

interface DailyLimitDto {
  bigBetsUsed: number
  bigBetsLimit: number        // from bettingRules.dailyBigBetLimit (3)
  resetsAt: string             // midnight UTC ISO
}

interface PlaceBetResponse {
  bet: BetDto
  wallet: WalletBalanceDto
}
```

### 4.4 Business Rule Validation (Server + Client)

Rules from `src/core/config/bettingRules.ts`:

| Rule | Value | Error code |
|------|-------|------------|
| Initial balance | 10,000 credits | — |
| Small bet | 1–500 credits | — |
| Big bet | 501–2,000 credits | — |
| Daily big bet limit | 3 per day | `DAILY_BIG_BET_LIMIT` |
| Invalid stake range | Outside small/big | `INVALID_STAKE` |
| Insufficient balance | stake > balance | `INSUFFICIENT_BALANCE` |
| Cancellation penalty | 10% of stake | Applied on cancel |

MSW enforces same rules server-side so UI validation matches API behavior.

### 4.5 MSW Handlers

**File:** `mocks/handlers/bets.handlers.ts`

- In-memory bet store per session user
- POST `/bets` deducts stake from wallet
- POST `/bets/:id/cancel` applies 10% penalty, refunds remainder
- GET `/bets/daily-limit` tracks big bets placed today

---

## 5. Wallet

### 5.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wallet/balance` | Yes | Current virtual balance |
| GET | `/wallet/transactions` | Yes | Credit/debit history |

### 5.2 DTOs

```typescript
interface WalletBalanceDto {
  balance: number
  currency: 'CREDITS'         // always virtual credits
  updatedAt: string
}

interface WalletTransactionDto {
  id: string
  type: 'initial' | 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_cancelled' | 'penalty' | 'adjustment'
  amount: number               // positive = credit, negative = debit
  balanceAfter: number
  description: string
  referenceId: string | null   // bet ID if applicable
  createdAt: string
}
```

### 5.3 MSW Handlers

**File:** `mocks/handlers/wallet.handlers.ts`

- Balance derived from transaction ledger
- Initial credit on registration: +10,000

---

## 6. Leaderboard

### 6.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leaderboard` | Yes | Season rankings |

### 6.2 Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `seasonId` | string | Defaults to active season |
| `sort` | `points` \| `roi` \| `form` \| `profitLoss` | Sort metric |
| `q` | string | Search username |
| `page` | number | Pagination |
| `limit` | number | Default 50 |

### 6.3 DTOs

```typescript
interface LeaderboardEntryDto {
  rank: number
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  roi: number                  // percentage
  profitLoss: number
  winRate: number              // percentage
  totalBets: number
  form: string[]               // last 5: 'W' | 'L' | 'V' (void)
  trend: 'up' | 'down' | 'stable'
}

interface LeaderboardDto {
  seasonId: string
  seasonName: string
  entries: LeaderboardEntryDto[]
  currentUserRank: number | null
}
```

### 6.4 MSW Handlers

**File:** `mocks/handlers/leaderboard.handlers.ts`

- 50 seed players with varied stats
- Current user inserted at configurable rank

---

## 7. Profile

### 7.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/players/:userId` | Yes | Public transparency profile |
| GET | `/players/:userId/stats` | Yes | Detailed season statistics |
| GET | `/players/:userId/bets` | Yes | Public bet history (read-only) |
| PATCH | `/profile` | Yes | Update own profile |

### 7.2 DTOs

```typescript
interface PublicProfileDto {
  id: string
  username: string
  avatarUrl: string | null
  memberSince: string
  currentRank: number
  seasonStats: SeasonStatsDto
  achievements: AchievementDto[]
}

interface SeasonStatsDto {
  seasonId: string
  points: number
  roi: number
  profitLoss: number
  winRate: number
  totalBets: number
  activeBets: number
  wins: number
  losses: number
  voids: number
  leaguePerformance: LeaguePerformanceDto[]
  form: string[]
  profitOverTime: TimeSeriesPoint[]
}

interface LeaguePerformanceDto {
  leagueId: string
  leagueName: string
  bets: number
  winRate: number
  profitLoss: number
}

interface TimeSeriesPoint {
  date: string
  value: number
}

interface AchievementDto {
  id: string
  name: string
  description: string
  iconUrl: string | null
  earnedAt: string
}

interface UpdateProfilePayload {
  username?: string
  avatarUrl?: string
}
```

### 7.3 MSW Handlers

**File:** `mocks/handlers/profile.handlers.ts`

---

## 8. Seasons

### 8.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/seasons` | Yes | List all seasons |
| GET | `/seasons/:seasonId` | Yes | Season detail + prizes |
| GET | `/seasons/active` | Yes | Current active season |

### 8.2 DTOs

```typescript
interface SeasonDto {
  id: string
  name: string                 // "Season 2026 Q1"
  status: 'upcoming' | 'active' | 'completed'
  startDate: string
  endDate: string
  participantCount: number
  prizePoolDescription: string
}

interface SeasonDetailDto extends SeasonDto {
  prizes: PrizeTierDto[]
  topRankings: LeaderboardEntryDto[]  // top 10 snapshot
  rules: string[]
}

interface PrizeTierDto {
  rankFrom: number
  rankTo: number
  prizeName: string
  prizeDescription: string
  imageUrl: string | null
}
```

### 8.3 MSW Handlers

**File:** `mocks/handlers/seasons.handlers.ts`

- One active season, two completed historical seasons

---

## 9. Notifications

### 9.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | Notification feed |
| GET | `/notifications/unread-count` | Yes | Unread badge count |
| PATCH | `/notifications/:id/read` | Yes | Mark single as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |

### 9.2 DTOs

```typescript
interface NotificationDto {
  id: string
  type: NotificationType       // bet_result | rank_change | season | system
  title: string
  body: string
  read: boolean
  data: Record<string, string> // contextual IDs (betId, seasonId)
  createdAt: string
}

interface UnreadCountDto {
  count: number
}
```

### 9.3 MSW Handlers

**File:** `mocks/handlers/notifications.handlers.ts`

- Generate notifications on bet settlement and rank changes (simulated)

---

## 10. Settings

### 10.1 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/settings` | Yes | User preferences |
| PATCH | `/settings` | Yes | Update preferences |

### 10.2 DTOs

```typescript
interface UserSettingsDto {
  emailNotifications: boolean   // future
  pushNotifications: boolean    // future
  showProfilePublicly: boolean
  defaultStake: number | null
}
```

---

## 11. Error Codes Catalog

| HTTP | Code | Message (example) | When |
|------|------|-------------------|------|
| 400 | `VALIDATION_ERROR` | Invalid input | Zod/schema failure; `details` per field |
| 400 | `INVALID_STAKE` | Stake must be 1–500 or 501–2000 | Bet placement |
| 400 | `DAILY_BIG_BET_LIMIT` | Daily big bet limit reached (3/3) | Bet placement |
| 400 | `INSUFFICIENT_BALANCE` | Insufficient virtual credits | Bet placement |
| 400 | `MARKET_SUSPENDED` | Selection no longer available | Bet placement |
| 400 | `MATCH_STARTED` | Cannot bet on started/finished match | Bet placement |
| 400 | `BET_NOT_CANCELLABLE` | Bet cannot be cancelled | Cancel bet |
| 401 | `UNAUTHORIZED` | Authentication required | Missing/invalid token |
| 401 | `TOKEN_EXPIRED` | Session expired | JWT expired |
| 403 | `FORBIDDEN` | Access denied | Wrong user resource |
| 404 | `NOT_FOUND` | Resource not found | Invalid ID |
| 409 | `DUPLICATE_USERNAME` | Username already taken | Registration |
| 409 | `DUPLICATE_EMAIL` | Email already registered | Registration |
| 422 | `INVALID_CREDENTIALS` | Invalid email or password | Login |
| 422 | `INVALID_RESET_TOKEN` | Reset token invalid or expired | Reset password |
| 429 | `RATE_LIMITED` | Too many requests | Auth endpoints |
| 0 | `NETWORK_ERROR` | Network error. Please try again. | Client-side (no response) |

### Error Handling in Axios

```typescript
// core/api/client.ts — already implemented
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.data) {
      throw new ApiError(error.response.status, error.response.data)
    }
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network error. Please try again.' })
  },
)
```

### 401 Global Handler

On `401` / `TOKEN_EXPIRED`:

1. `authStore.clearSession()`
2. Redirect to `/auth/login?redirect=...`
3. Toast: "Session expired. Please log in again."

---

## 12. MSW Setup

### 12.1 Bootstrap

```typescript
// mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

```typescript
// app/providers.tsx (dev only)
if (env.enableMsw && env.isDev) {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'warn' })
}
```

### 12.2 Handler Index

```typescript
// mocks/handlers/index.ts
export const handlers = [
  ...authHandlers,
  ...fixturesHandlers,
  ...betsHandlers,
  ...walletHandlers,
  ...leaderboardHandlers,
  ...profileHandlers,
  ...seasonsHandlers,
  ...notificationsHandlers,
]
```

### 12.3 MSW ↔ Service Mapping

| Service function | MSW handler | Seed data |
|------------------|-------------|-----------|
| `authService.login` | POST `/auth/login` | `users.json` |
| `fixturesService.list` | GET `/fixtures` | `fixtures.json` |
| `fixturesService.getById` | GET `/fixtures/:id` | `fixtures.json` |
| `betsService.place` | POST `/bets` | in-memory |
| `betsService.cancel` | POST `/bets/:id/cancel` | in-memory |
| `walletService.getBalance` | GET `/wallet/balance` | derived |
| `leaderboardService.list` | GET `/leaderboard` | generated |
| `profileService.getPublic` | GET `/players/:id` | `users.json` + stats |
| `seasonsService.list` | GET `/seasons` | `seasons.json` |
| `notificationsService.list` | GET `/notifications` | in-memory |

---

## 13. Service Layer Pattern

Each feature implements:

```typescript
// features/fixtures/api/fixtures.service.ts
export async function listFixtures(params?: FixtureListParams): Promise<FixtureDto[]> {
  const { data } = await apiClient.get<ApiResponse<FixtureDto[]>>('/fixtures', { params })
  return data.data
}
```

Optional direct mock for unit tests:

```typescript
// features/fixtures/api/fixtures.service.mock.ts
export const mockFixturesService = {
  list: async () => seedFixtures,
}
```

---

## 14. Pagination Convention

Requests: `?page=1&limit=20`

Response meta:

```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 142, "totalPages": 8 }
}
```

---

## 15. Date & Time

- All API timestamps: **ISO 8601 UTC** (`2026-06-19T14:30:00.000Z`)
- Display: convert to user locale in `shared/utils/formatDate.ts`
- Kickoff times: show relative ("in 2h") + absolute on hover

---

## 16. Future Backend Notes

When Fastify backend is implemented:

1. Match all paths and DTOs in this document
2. JWT expiry: 15 min access + refresh token (httpOnly cookie)
3. Socket.IO events mirror Query invalidation triggers
4. Rate limiting on auth endpoints
5. OpenAPI spec generated from same schema (optional)

**Switching from MSW to real API:**

```env
VITE_ENABLE_MSW=false
VITE_API_URL=https://api.sportstipster.com/api
```

No frontend code changes required beyond env.

---

## 17. Related Documents

- `STATE_MANAGEMENT_PLAN.md` — Query keys and invalidation
- `PROJECT_ARCHITECTURE.md` — Axios client and data flow
- `core/config/bettingRules.ts` — Business rule constants

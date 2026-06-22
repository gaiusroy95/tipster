# State Management Plan — Sports Tipster Platform

> Clear boundaries between TanStack Query (server state) and Zustand (client state).

## 1. Overview

| Concern | Tool | Rationale |
|---------|------|-----------|
| API data (fixtures, bets, wallet, etc.) | **TanStack Query** | Caching, deduplication, background refresh, mutation lifecycle |
| Auth session | **Zustand** | Synchronous access for guards and Axios interceptor |
| Bet slip selections | **Zustand** | Client-only; survives navigation within session |
| UI preferences | **Zustand** | Sidebar, drawer open state |
| Form inputs | **React Hook Form** | Local ephemeral state with validation |

### Golden Rule

> **Never duplicate server data in Zustand.** After a mutation, invalidate Query cache keys — do not manually patch Zustand with API response data except auth user snapshot.

---

## 2. TanStack Query Configuration

### 2.1 QueryClient Defaults

```typescript
// core/api/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s default
      gcTime: 5 * 60_000,       // 5 min garbage collection
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

### 2.2 Per-Domain Stale Times

| Domain | staleTime | refetchInterval | Notes |
|--------|-----------|-----------------|-------|
| Auth (`/auth/me`) | 5 min | — | Validated on app load |
| Fixtures list | 30s | 60s if live matches | Poll when live filter active |
| Fixture detail | 15s | 30s if match live | Odds updates |
| Wallet | 30s | — | Invalidate on bet mutations |
| Active bets | 30s | 60s | Settled bets removed on refresh |
| Bet history | 2 min | — | Paginated |
| Leaderboard | 60s | — | Invalidate on bet settlement |
| Profile | 2 min | — | Public profile cacheable |
| Notifications | 30s | 60s | Unread count in header |
| Seasons | 10 min | — | Rarely changes |

---

## 3. Cache Key Factory Pattern

Each feature defines a key factory in `features/{name}/hooks/{name}Keys.ts`.

### 3.1 Pattern

```typescript
// features/fixtures/hooks/fixtureKeys.ts
export const fixtureKeys = {
  all: ['fixtures'] as const,
  lists: () => [...fixtureKeys.all, 'list'] as const,
  list: (filters?: FixtureFilters) => [...fixtureKeys.lists(), filters] as const,
  details: () => [...fixtureKeys.all, 'detail'] as const,
  detail: (matchId: string) => [...fixtureKeys.details(), matchId] as const,
}
```

### 3.2 Key Factories by Feature

#### Auth Keys

```typescript
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}
```

#### Wallet Keys

```typescript
export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  transactions: (params?: TransactionParams) =>
    [...walletKeys.all, 'transactions', params] as const,
}
```

#### Bet Keys

```typescript
export const betKeys = {
  all: ['bets'] as const,
  active: () => [...betKeys.all, 'active'] as const,
  history: (params?: BetHistoryParams) => [...betKeys.all, 'history', params] as const,
  detail: (betId: string) => [...betKeys.all, 'detail', betId] as const,
  dailyLimit: () => [...betKeys.all, 'daily-limit'] as const,
}
```

#### Leaderboard Keys

```typescript
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (params?: LeaderboardParams) => [...leaderboardKeys.all, 'list', params] as const,
}
```

#### Profile Keys

```typescript
export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  stats: (userId: string, seasonId?: string) =>
    [...profileKeys.all, userId, 'stats', seasonId] as const,
}
```

#### Season Keys

```typescript
export const seasonKeys = {
  all: ['seasons'] as const,
  list: () => [...seasonKeys.all, 'list'] as const,
  detail: (seasonId: string) => [...seasonKeys.all, 'detail', seasonId] as const,
}
```

#### Notification Keys

```typescript
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationParams) => [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}
```

### 3.3 Invalidation Matrix

| Mutation | Invalidate |
|----------|------------|
| `placeBet` | `betKeys.active`, `walletKeys.balance`, `walletKeys.transactions`, `betKeys.dailyLimit`, `fixtureKeys.detail(id)` |
| `cancelBet` | `betKeys.active`, `betKeys.history`, `walletKeys.balance`, `walletKeys.transactions` |
| `updateProfile` | `authKeys.me`, `profileKeys.detail(userId)` |
| `markNotificationRead` | `notificationKeys.list`, `notificationKeys.unreadCount` |
| `login` / `logout` | `queryClient.clear()` on logout; prefetch `authKeys.me` on login |

---

## 4. Zustand Stores

### 4.1 Auth Store

**File:** `features/auth/stores/authStore.ts`

```typescript
interface AuthState {
  user: UserDto | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean

  // Actions
  setSession: (token: string, user: UserDto) => void
  clearSession: () => void
  initialize: () => Promise<void>
  updateUser: (partial: Partial<UserDto>) => void
}
```

**Persistence:**

- Token stored in `sessionStorage` under key `st_auth_token`
- User object NOT persisted separately — re-fetched via `authKeys.me` on init
- On `setSession`: call `setAuthToken(token)` from `core/api/client.ts`

**Logout sequence:**

1. `clearSession()` — clear store + sessionStorage
2. `setAuthToken(null)`
3. `queryClient.clear()`

### 4.2 Bet Slip Store

**File:** `features/betting/stores/betSlipStore.ts`

```typescript
interface BetSelection {
  matchId: string
  matchLabel: string       // "Arsenal vs Chelsea"
  marketType: MarketType // malay | handicap | over_under
  selectionKey: string   // unique key per market outcome
  selectionLabel: string // "Home -0.5 @ 1.95"
  odds: number
}

interface BetSlipState {
  selections: BetSelection[]
  stake: number
  isOpen: boolean          // drawer visibility (mobile)

  addSelection: (selection: BetSelection) => void
  removeSelection: (selectionKey: string) => void
  updateStake: (stake: number) => void
  clearSlip: () => void
  setOpen: (open: boolean) => void
  toggleSelection: (selection: BetSelection) => void
}
```

**Persistence:**

- Optional `sessionStorage` persist middleware for selections + stake
- Cleared on successful `placeBet` mutation
- Single-selection MVP: max 1 selection in slip (extend later for accumulators)

**Validation (derived, not stored):**

```typescript
// Computed in selectors or hooks — NOT stored in Zustand
const betSize = getBetSize(stake)           // from bettingRules
const isValidStake = isValidStake(stake)
const dailyBigBetsRemaining = from Query      // betKeys.dailyLimit
```

### 4.3 UI Store

**File:** `shared/stores/uiStore.ts` (or `core/stores/uiStore.ts`)

```typescript
interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Future: theme preference
  // theme: 'dark' | 'light'
}
```

**Persistence:** `localStorage` for sidebar preference only.

---

## 5. React Hook Form (Local Form State)

Used for:

- Auth forms (login, register, reset password)
- Profile edit form
- Settings toggles (optional RHF; simple useState acceptable)

**Pattern:**

```typescript
const schema = loginSchema // Zod
const form = useForm<LoginFormData>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})
```

**Server error mapping:**

```typescript
onError: (error: ApiError) => {
  if (error.details) {
    Object.entries(error.details).forEach(([field, messages]) => {
      form.setError(field as keyof LoginFormData, { message: messages[0] })
    })
  }
}
```

---

## 6. Boundaries: Decision Tree

```
Is the data returned from an API?
├── YES → TanStack Query
│   ├── Read → useQuery + service
│   └── Write → useMutation + invalidate keys
└── NO → Is it needed across routes without server round-trip?
    ├── YES → Zustand
    └── NO → useState / useReducer / React Hook Form
```

### Examples

| Data | Store | Why |
|------|-------|-----|
| Fixture list | Query | Server data |
| Virtual balance | Query | Server data (wallet endpoint) |
| Bet slip selections | Zustand | Client-only until submit |
| JWT token | Zustand + sessionStorage | Client session |
| Login form email field | RHF | Ephemeral form state |
| Modal open state | useState | Component-local |
| Sidebar collapsed | Zustand | Cross-route UI preference |
| Odds on screen | Query | From fixture detail API |

---

## 7. Selectors & Performance

### 7.1 Zustand Selectors

Always use granular selectors to prevent unnecessary re-renders:

```typescript
// Good
const stake = useBetSlipStore((s) => s.stake)

// Avoid
const store = useBetSlipStore()
```

### 7.2 Query Selectors

Use `select` option to derive minimal data:

```typescript
useQuery({
  queryKey: walletKeys.balance(),
  queryFn: fetchBalance,
  select: (data) => data.balance,
})
```

---

## 8. Optimistic Updates

Use sparingly — only where UX benefit is high and rollback is straightforward.

| Mutation | Optimistic? | Rollback |
|----------|-------------|----------|
| Place bet | No | Wait for server (balance validation) |
| Cancel bet | Optional | Revert on error |
| Mark notification read | Yes | Revert on error |
| Update profile | No | Wait for confirmation |

---

## 9. DevTools

- **TanStack Query DevTools** — Enabled in development only via `providers.tsx`
- **Zustand devtools middleware** — Optional for auth and bet slip stores

---

## 10. Testing State

| Layer | Approach |
|-------|----------|
| Query hooks | Wrap in `QueryClientProvider` with test client; MSW handlers |
| Zustand stores | Reset store between tests via `store.setState(initialState)` |
| Mutations | Assert invalidation via mock `queryClient.invalidateQueries` |

---

## 11. Future: Socket.IO Integration

When real-time backend ships:

1. Socket events trigger `queryClient.invalidateQueries({ queryKey: fixtureKeys.detail(id) })`
2. Do NOT push socket payloads into Zustand for server data
3. Optional: Zustand flag `liveConnectionStatus` for UI indicator

---

## 12. Related Documents

- `API_INTEGRATION_PLAN.md` — Endpoints that feed Query cache
- `PROJECT_ARCHITECTURE.md` — Data flow diagrams
- `COMPONENT_GUIDELINES.md` — Hook consumption in components

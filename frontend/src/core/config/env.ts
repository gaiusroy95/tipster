/**
 * Ensures API requests hit Express routes mounted at `/api/*`.
 * Accepts:
 * - `/api` (local Vite proxy / Vercel same-origin)
 * - `https://backend.example.com/api`
 * - `https://backend.example.com` (auto-appends `/api`)
 */
function normalizeApiBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? '/api').trim().replace(/\/+$/, '')
  if (!trimmed) return '/api'

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  if (trimmed.endsWith('/api')) return trimmed
  return `${trimmed}/api`
}

/** Sports routes are mounted at `/sports` on the backend (not under `/api`). */
function normalizeSportsApiBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? 'http://localhost:3000').trim().replace(/\/+$/, '')
  if (!trimmed) return 'http://localhost:3000'

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  return trimmed.replace(/\/api$/, '')
}

export const env = {
  apiUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  sportsApiUrl: normalizeSportsApiBaseUrl(import.meta.env.VITE_SPORTS_API_URL),
  enableMsw: import.meta.env.VITE_ENABLE_MSW === 'true',
  isDev: import.meta.env.DEV,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  /** Google Identity Services popup — requires Authorized JavaScript origins in Google Cloud. */
  googleUseGsi: import.meta.env.VITE_GOOGLE_USE_GSI === 'true',
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID ?? '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
}

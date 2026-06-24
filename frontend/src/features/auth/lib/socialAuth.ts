import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { ApiError } from '@/core/types/api'
import { ROUTES } from '@/core/constants/routes'
import type {
  OAuthUrlResponse,
  SocialAuthMode,
  SocialAuthResponse,
} from '@/features/auth/types/socialAuth'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'

export const OAUTH_PROVIDER_STORAGE_KEY = 'oauth_provider'
export const OAUTH_MODE_STORAGE_KEY = 'oauth_mode'

const inflightExchanges = new Map<string, Promise<SocialAuthResponse>>()

export function persistOAuthSession(provider: SocialAuthProvider, mode: SocialAuthMode): void {
  sessionStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, provider)
  sessionStorage.setItem(OAUTH_MODE_STORAGE_KEY, mode)
  localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, provider)
  localStorage.setItem(OAUTH_MODE_STORAGE_KEY, mode)
}

export function readOAuthSession(): { provider: SocialAuthProvider | null; mode: SocialAuthMode | null } {
  const provider =
    sessionStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY) ??
    localStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY)
  const mode =
    sessionStorage.getItem(OAUTH_MODE_STORAGE_KEY) ?? localStorage.getItem(OAUTH_MODE_STORAGE_KEY)

  const parsedMode =
    mode === 'login' || mode === 'register' || mode === 'link' ? (mode as SocialAuthMode) : null

  const parsedProvider =
    provider === 'google' || provider === 'facebook' || provider === 'apple'
      ? (provider as SocialAuthProvider)
      : null

  return { provider: parsedProvider, mode: parsedMode }
}

export function clearOAuthSession(): void {
  sessionStorage.removeItem(OAUTH_PROVIDER_STORAGE_KEY)
  sessionStorage.removeItem(OAUTH_MODE_STORAGE_KEY)
  localStorage.removeItem(OAUTH_PROVIDER_STORAGE_KEY)
  localStorage.removeItem(OAUTH_MODE_STORAGE_KEY)
}

export function getOAuthRedirectUri(): string {
  return `${getAppOrigin()}${ROUTES.OAUTH_CALLBACK}`
}

function getAppOrigin(): string {
  const { protocol, hostname, port } = window.location
  // Google OAuth redirect URIs must match exactly — normalize 127.0.0.1 → localhost for dev.
  if (hostname === '127.0.0.1') {
    const portSuffix = port ? `:${port}` : ''
    return `${protocol}//localhost${portSuffix}`
  }
  return window.location.origin
}

export function getOAuthCallbackParams(): { code: string | null; state: string | null; error: string | null } {
  const params = new URLSearchParams(window.location.search)
  return {
    code: params.get('code'),
    state: params.get('state'),
    error: params.get('error'),
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.status === 503 || error.status === 502
  }
  return false
}

export async function withAuthRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryableAuthError(error) || attempt >= maxAttempts) {
        throw error
      }
      await sleep(attempt * 1500)
    }
  }

  throw lastError
}

export async function initiateSocialAuth(provider: SocialAuthProvider, mode: SocialAuthMode): Promise<void> {
  persistOAuthSession(provider, mode)
  const redirectUri = getOAuthRedirectUri()

  const res = await withAuthRetry(() =>
    apiClient.get<ApiResponse<OAuthUrlResponse>>(`/auth/oauth/${provider}/url`, {
      params: { mode, redirectUri },
      timeout: 45000,
    }),
  )

  const url = res.data.data.url
  if (url.startsWith('http')) {
    window.location.href = url
    return
  }

  window.location.assign(url)
}

export async function exchangeOAuthCodeOnce(
  state: string,
  exchange: () => Promise<SocialAuthResponse>,
): Promise<SocialAuthResponse> {
  const inflight = inflightExchanges.get(state)
  if (inflight) return inflight

  // OAuth codes are single-use — do not retry the complete request on 503.
  const promise = exchange().finally(() => {
    inflightExchanges.delete(state)
  })
  inflightExchanges.set(state, promise)
  return promise
}

export async function completeOAuthFromCallback(
  code: string,
  state: string,
): Promise<SocialAuthResponse> {
  return exchangeOAuthCodeOnce(state, async () => {
    const res = await apiClient.post<ApiResponse<SocialAuthResponse>>('/auth/oauth/complete', {
      code,
      state,
      redirectUri: getOAuthRedirectUri(),
    }, { timeout: 45000 })
    return res.data.data
  })
}

export async function linkOAuthFromCallback(
  code: string,
  state: string,
): Promise<{ user: import('@/mocks/data/types').User }> {
  const res = await withAuthRetry(() =>
    apiClient.post<ApiResponse<{ user: import('@/mocks/data/types').User }>>(
      '/auth/oauth/complete/link',
      {
        code,
        state,
        redirectUri: getOAuthRedirectUri(),
      },
      { timeout: 45000 },
    ),
  )
  return res.data.data
}

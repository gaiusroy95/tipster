import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { ROUTES } from '@/core/constants/routes'
import type { OAuthUrlResponse, SocialAuthMode } from '@/features/auth/types/socialAuth'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'

export function getOAuthRedirectUri(): string {
  return `${window.location.origin}${ROUTES.OAUTH_CALLBACK}`
}

export async function initiateSocialAuth(provider: SocialAuthProvider, mode: SocialAuthMode): Promise<void> {
  const redirectUri = getOAuthRedirectUri()
  const res = await apiClient.get<ApiResponse<OAuthUrlResponse>>(`/auth/oauth/${provider}/url`, {
    params: { mode, redirectUri },
  })

  const url = res.data.data.url
  if (url.startsWith('http')) {
    window.location.href = url
    return
  }

  window.location.assign(url)
}

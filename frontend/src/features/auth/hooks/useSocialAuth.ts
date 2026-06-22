import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type {
  LinkedAccountsResponse,
  SocialAuthProvider,
  SocialAuthResponse,
} from '@/features/auth/types/socialAuth'
import { getOAuthRedirectUri } from '@/features/auth/lib/socialAuth'

interface OAuthExchangePayload {
  provider: SocialAuthProvider
  code: string
  state: string
}

function exchangeOAuthCode(payload: OAuthExchangePayload) {
  const { provider, code, state } = payload
  return apiClient.post<ApiResponse<SocialAuthResponse>>(`/auth/oauth/${provider}`, {
    code,
    state,
    redirectUri: getOAuthRedirectUri(),
  })
}

export function useCompleteSocialAuth() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: OAuthExchangePayload) => {
      const res = await exchangeOAuthCode(payload)
      return res.data.data
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      queryClient.clear()
    },
  })
}

export function useLinkedAccounts() {
  return useQuery({
    queryKey: queryKeys.auth.linkedAccounts(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LinkedAccountsResponse>>('/auth/linked-accounts')
      return res.data.data
    },
  })
}

export function useLinkSocialAccount() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (payload: OAuthExchangePayload) => {
      const { provider, code, state } = payload
      const res = await apiClient.post<ApiResponse<{ user: import('@/mocks/data/types').User }>>(
        `/auth/oauth/${provider}/link`,
        { code, state, redirectUri: getOAuthRedirectUri() },
      )
      return res.data.data
    },
    onSuccess: ({ user }) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.linkedAccounts() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(user.id) })
    },
  })
}

export function useUnlinkSocialAccount() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (provider: SocialAuthProvider) => {
      const res = await apiClient.delete<ApiResponse<{ user: import('@/mocks/data/types').User }>>(
        `/auth/oauth/${provider}/unlink`,
      )
      return res.data.data
    },
    onSuccess: ({ user }) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.linkedAccounts() })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

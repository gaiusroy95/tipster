import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, setAuthToken } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type {
  LinkedAccountsResponse,
  SocialAuthProvider,
  SocialAuthResponse,
} from '@/features/auth/types/socialAuth'
import {
  completeOAuthFromCallback,
  linkOAuthFromCallback,
} from '@/features/auth/lib/socialAuth'

interface OAuthExchangePayload {
  provider: SocialAuthProvider
  code: string
  state: string
}

function exchangeOAuthCode(payload: OAuthExchangePayload): Promise<SocialAuthResponse> {
  const { state } = payload
  return completeOAuthFromCallback(payload.code, state)
}

export function useCompleteSocialAuth() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OAuthExchangePayload) => exchangeOAuthCode(payload),
    onSuccess: ({ user, token }) => {
      setAuthToken(token)
      apiClient
        .get<ApiResponse<import('@/mocks/data/types').User>>('/auth/me')
        .then((meRes) => {
          setAuth(meRes.data.data, token)
          if (import.meta.env.VITE_ENABLE_MSW === 'true') {
            import('@/mocks/data/seed').then(({ mockDb }) =>
              mockDb.upsertRemoteUser(meRes.data.data),
            )
          }
        })
        .catch(() => {
          setAuth(user, token)
          if (import.meta.env.VITE_ENABLE_MSW === 'true') {
            import('@/mocks/data/seed').then(({ mockDb }) => mockDb.upsertRemoteUser(user))
          }
        })
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
      const { code, state } = payload
      const res = await linkOAuthFromCallback(code, state)
      return res
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

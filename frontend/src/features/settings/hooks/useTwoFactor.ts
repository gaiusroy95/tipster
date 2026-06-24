import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { User } from '@/mocks/data/types'
import { saveTwoFactorTrustToken } from '@/features/auth/lib/twoFactorTrust'

export type TwoFactorMethod = 'authenticator' | 'phone'

export interface TwoFactorStatus {
  twoFactorEnabled: boolean
  twoFactorMethod: TwoFactorMethod | null
  phoneNumberMasked: string | null
}

export interface AuthenticatorSetup {
  secret: string
  otpauthUrl: string
  qrCodeUrl: string
}

export interface TwoFactorLoginChallenge {
  requiresTwoFactor: true
  twoFactorSession: string
  method: TwoFactorMethod
  phoneNumberMasked: string | null
}

export type LoginResponse =
  | { user: User; token: string }
  | TwoFactorLoginChallenge

export function isTwoFactorChallenge(
  result: LoginResponse,
): result is TwoFactorLoginChallenge {
  return 'requiresTwoFactor' in result && result.requiresTwoFactor === true
}

export function useSetupAuthenticator() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<ApiResponse<AuthenticatorSetup>>('/auth/2fa/authenticator/setup')
      return res.data.data
    },
  })
}

export function useConfirmAuthenticator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/authenticator/confirm', {
        code,
      })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() })
    },
  })
}

export function useSetupPhone() {
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiClient.post<ApiResponse<{ message: string; phoneNumberMasked: string; devCodeHint?: string }>>(
        '/auth/2fa/phone/setup',
        { phoneNumber },
      )
      return res.data.data
    },
  })
}

export function useConfirmPhone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/phone/confirm', { code })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() })
    },
  })
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { password: string; code: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/disable', data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() })
    },
  })
}

export function useResendDisablePhoneCode() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/2fa/phone/resend-disable')
      return res.data.data
    },
  })
}

export function useVerifyTwoFactorLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { session: string; code: string; trustDevice: boolean; email: string }) => {
      const res = await apiClient.post<
        ApiResponse<{ user: User; token: string; trustToken?: string }>
      >('/auth/2fa/verify-login', {
        session: data.session,
        code: data.code,
        trustDevice: data.trustDevice,
      })
      return { ...res.data.data, email: data.email }
    },
    onSuccess: ({ user, token, trustToken, email }) => {
      if (trustToken) {
        saveTwoFactorTrustToken(email, trustToken)
      }
      setAuth(user, token)
      queryClient.clear()
    },
  })
}

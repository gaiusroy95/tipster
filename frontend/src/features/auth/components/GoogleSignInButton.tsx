import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { ROUTES } from '@/core/constants/routes'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { completeGoogleCredential } from '@/features/auth/lib/socialAuth'
import type { SocialAuthMode } from '@/features/auth/types/socialAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { apiClient, setAuthToken } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { cn } from '@/shared/utils/cn'

export function GoogleSignInButton({ mode }: { mode: SocialAuthMode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const actionLabel = mode === 'register' ? 'Sign up' : 'Continue'

  const finishSignIn = async (credential: string) => {
    setLoading(true)
    try {
      const result = await completeGoogleCredential(credential)
      setAuthToken(result.token)

      let user = result.user
      try {
        const meRes = await apiClient.get<ApiResponse<import('@/mocks/data/types').User>>('/auth/me')
        user = meRes.data.data
      } catch {
        // OAuth response already includes user
      }

      setAuth(user, result.token)
      if (import.meta.env.VITE_ENABLE_MSW === 'true') {
        const { mockDb } = await import('@/mocks/data/seed')
        mockDb.upsertRemoteUser(user)
      }
      queryClient.clear()

      if (result.isNewUser) {
        toast('Welcome! You received 1,000,000 virtual credits.', 'success')
      }
      navigate(ROUTES.HOME, { replace: true })
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Google sign-in failed'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      toast('Google sign-in failed', 'error')
      return
    }
    void finishSignIn(response.credential)
  }

  return (
    <div className={cn('relative w-full', loading && 'pointer-events-none opacity-70')}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-bg-surface/80">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast('Google sign-in was cancelled or failed', 'error')}
        useOneTap={false}
        theme="filled_black"
        size="large"
        text={mode === 'register' ? 'signup_with' : 'continue_with'}
        shape="rectangular"
        width="100%"
        containerProps={{
          className: 'w-full [&>div]:!w-full',
          'aria-label': `${actionLabel} with Google`,
        }}
      />
    </div>
  )
}

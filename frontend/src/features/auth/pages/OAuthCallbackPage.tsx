import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { ROUTES } from '@/core/constants/routes'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  clearOAuthSession,
  completeOAuthFromCallback,
  getOAuthCallbackParams,
  linkOAuthFromCallback,
  readOAuthSession,
} from '@/features/auth/lib/socialAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'

/** One toast + navigation per OAuth callback URL (prevents Strict Mode / effect re-run spam). */
const handledCallbackKeys = new Set<string>()

function showErrorOnce(key: string, toast: (msg: string, type: 'error') => void, message: string) {
  if (handledCallbackKeys.has(key)) return
  handledCallbackKeys.add(key)
  toast(message, 'error')
}

function markHandled(key: string) {
  handledCallbackKeys.add(key)
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const callbackKey = window.location.search || window.location.pathname
    if (handledCallbackKeys.has(callbackKey)) return

    const { code, state, error: oauthError } = getOAuthCallbackParams()
    const { mode: oauthMode } = readOAuthSession()

    if (oauthError) {
      markHandled(callbackKey)
      clearOAuthSession()
      toast('Social sign-in was cancelled or failed', 'error')
      navigate(token ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      return
    }

    if (!code || !state) {
      if (!window.location.search.includes('code=')) {
        markHandled(callbackKey)
        clearOAuthSession()
        showErrorOnce(callbackKey, toast, 'Invalid social sign-in response')
        navigate(token ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      }
      return
    }

    const shouldLink = oauthMode === 'link' && token

    if (oauthMode === 'link' && !token) {
      markHandled(callbackKey)
      clearOAuthSession()
      toast('Sign in first to connect a social account', 'error')
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    const runKey = `oauth-run-${state}`

    if (handledCallbackKeys.has(runKey)) return
    handledCallbackKeys.add(runKey)

    const run = async () => {
      try {
        if (shouldLink) {
          const { user } = await linkOAuthFromCallback(code, state)
          markHandled(callbackKey)
          useAuthStore.getState().setUser(user)
          clearOAuthSession()
          toast('Social account connected', 'success')
          navigate(ROUTES.SETTINGS, { replace: true })
          return
        }

        const result = await completeOAuthFromCallback(code, state)
        markHandled(callbackKey)

        setAuth(result.user, result.token)
        clearOAuthSession()
        navigate(ROUTES.HOME, { replace: true })

        void queryClient.clear()
        if (import.meta.env.VITE_ENABLE_MSW === 'true') {
          void import('@/mocks/data/seed').then(({ mockDb }) => {
            mockDb.upsertRemoteUser(result.user)
          })
        }
        if (result.isNewUser) {
          toast('Welcome! You received 1,000,000 virtual credits.', 'success')
        }
      } catch (e) {
        markHandled(callbackKey)
        clearOAuthSession()
        const msg = e instanceof ApiError ? e.message : 'Social sign-in failed'
        toast(msg, 'error')
        navigate(shouldLink ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      }
    }

    run()
  }, [navigate, queryClient, setAuth, toast, token])

  return (
    <Card>
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="text-text-muted">Completing sign-in…</p>
      </CardContent>
    </Card>
  )
}

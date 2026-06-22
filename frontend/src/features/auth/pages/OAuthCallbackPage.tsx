import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { ROUTES } from '@/core/constants/routes'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  useCompleteSocialAuth,
  useLinkSocialAccount,
} from '@/features/auth/hooks/useSocialAuth'
import { ALL_SOCIAL_PROVIDERS } from '@/core/constants/socialProviders'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'

function parseProvider(value: string | null): SocialAuthProvider | null {
  if (!value || !ALL_SOCIAL_PROVIDERS.includes(value as SocialAuthProvider)) return null
  return value as SocialAuthProvider
}

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { toast } = useToast()
  const token = useAuthStore((s) => s.token)
  const completeAuth = useCompleteSocialAuth()
  const linkAccount = useLinkSocialAccount()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return

    const oauthError = params.get('error')
    const provider = parseProvider(params.get('provider'))
    const code = params.get('code')
    const state = params.get('state')

    if (oauthError) {
      handledRef.current = true
      toast('Social sign-in was cancelled or failed', 'error')
      navigate(token ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      return
    }

    if (!provider || !code || !state) {
      handledRef.current = true
      toast('Invalid social sign-in response', 'error')
      navigate(token ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      return
    }

    handledRef.current = true
    const payload = { provider, code, state }

    const run = async () => {
      try {
        if (token) {
          await linkAccount.mutateAsync(payload)
          toast('Social account connected', 'success')
          navigate(ROUTES.SETTINGS, { replace: true })
          return
        }

        const result = await completeAuth.mutateAsync(payload)
        if (result.isNewUser) {
          toast('Welcome! You received 10,000 virtual credits.', 'success')
        }
        navigate(ROUTES.HOME, { replace: true })
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Social sign-in failed'
        toast(msg, 'error')
        navigate(token ? ROUTES.SETTINGS : ROUTES.LOGIN, { replace: true })
      }
    }

    run()
  }, [completeAuth, linkAccount, navigate, params, toast, token])

  return (
    <Card>
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="text-text-muted">Completing sign-in…</p>
      </CardContent>
    </Card>
  )
}

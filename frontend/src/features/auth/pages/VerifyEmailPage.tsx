import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/core/constants/routes'
import { useVerifyEmail } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCard } from '@/features/auth/components/AuthCard'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyToken = searchParams.get('token')
  const verify = useVerifyEmail()
  const { toast } = useToast()
  const startedRef = useRef(false)

  useEffect(() => {
    if (!verifyToken || startedRef.current) return
    startedRef.current = true

    verify
      .mutateAsync({ token: verifyToken })
      .then((result) => {
        toast(result.message, 'success')
        navigate(ROUTES.HOME, { replace: true })
      })
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : 'Verification failed'
        toast(msg, 'error')
      })
  }, [navigate, toast, verify, verifyToken])

  if (!verifyToken) {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Verify email"
          subtitle="This verification link is invalid or has expired"
        />
        <CardContent className="px-6 pb-6 space-y-4">
          <p className="text-sm text-text-muted">
            Register again or request a new verification email from the sign-in page.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="text-sm font-medium text-accent-secondary hover:underline"
          >
            Back to sign in
          </Link>
          <AuthFormFooter variant="back-to-login" />
        </CardContent>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthCardHeader title="Verify email" subtitle="Confirming your email address…" />
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <p className="text-text-muted text-sm">Verifying your account…</p>
        {verify.isError && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-accent-loss">
              {verify.error instanceof ApiError ? verify.error.message : 'Verification failed'}
            </p>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
              Back to sign in
            </Button>
          </div>
        )}
      </CardContent>
    </AuthCard>
  )
}

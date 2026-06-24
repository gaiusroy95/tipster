import { type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  EnvelopeOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/core/constants/routes'
import { useVerifyEmail } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { cn } from '@/shared/utils/cn'
import { useEffect } from 'react'

/** One verification attempt per token (prevents Strict Mode / effect re-run failures). */
const handledVerifyTokens = new Set<string>()

function VerifyEmailShell({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  children,
}: {
  icon: ReactNode
  iconTone?: 'primary' | 'warning'
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <AuthCard className="border-border-default/60">
      <CardContent className="px-8 py-10 text-center">
        <div
          className={cn(
            'mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ring-1',
            iconTone === 'primary' &&
              'bg-accent-primary/10 ring-accent-primary/25 text-accent-primary',
            iconTone === 'warning' &&
              'bg-accent-loss/10 ring-accent-loss/25 text-accent-loss',
          )}
        >
          {icon}
        </div>
        <h1 className="text-xl font-display font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{subtitle}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </CardContent>
    </AuthCard>
  )
}

function VerifyingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-10 w-10" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-2 border-border-default/80" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
      <p className="text-sm text-text-muted">This usually takes a few seconds…</p>
    </div>
  )
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyToken = searchParams.get('token')
  const verify = useVerifyEmail()
  const { toast } = useToast()

  useEffect(() => {
    if (!verifyToken || handledVerifyTokens.has(verifyToken)) return
    handledVerifyTokens.add(verifyToken)

    verify
      .mutateAsync({ token: verifyToken })
      .then((result) => {
        toast(result.message, 'success')
        navigate(ROUTES.HOME, { replace: true })
      })
      .catch((e) => {
        if (e instanceof ApiError && e.code === 'INVALID_VERIFY_TOKEN') {
          handledVerifyTokens.delete(verifyToken)
        }
        const msg = e instanceof ApiError ? e.message : 'Verification failed'
        toast(msg, 'error')
      })
  }, [navigate, toast, verify, verifyToken])

  if (!verifyToken) {
    return (
      <VerifyEmailShell
        icon={<ExclamationTriangleIcon className="h-7 w-7" strokeWidth={1.75} />}
        iconTone="warning"
        title="Link expired"
        subtitle="This verification link is invalid or has expired."
      >
        <p className="mb-6 text-sm text-text-muted">
          Register again or request a new verification email from the sign-in page.
        </p>
        <Button type="button" className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>
          Back to sign in
        </Button>
      </VerifyEmailShell>
    )
  }

  if (verify.isError) {
    const message =
      verify.error instanceof ApiError ? verify.error.message : 'Verification failed'

    return (
      <VerifyEmailShell
        icon={<ExclamationTriangleIcon className="h-7 w-7" strokeWidth={1.75} />}
        iconTone="warning"
        title="Verification failed"
        subtitle={message}
      >
        <div className="flex flex-col gap-3">
          <Button type="button" className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>
            Back to sign in
          </Button>
          <Link
            to={ROUTES.REGISTER}
            className="text-sm font-medium text-accent-secondary hover:underline"
          >
            Create a new account
          </Link>
        </div>
      </VerifyEmailShell>
    )
  }

  return (
    <VerifyEmailShell
      icon={<EnvelopeOpenIcon className="h-7 w-7" strokeWidth={1.75} />}
      title="Verify email"
      subtitle="Confirming your email address…"
    >
      <VerifyingSpinner />
    </VerifyEmailShell>
  )
}

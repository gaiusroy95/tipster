import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

type AuthFormFooterProps =
  | { variant: 'login' }
  | { variant: 'register' }
  | { variant: 'back-to-login' }

function AuthFooterShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 pt-6 border-t border-border-default/40">
      {children}
    </div>
  )
}

function accentLinkClassName(className?: string) {
  return cn(
    'font-semibold text-accent-secondary underline-offset-4 hover:underline transition-colors',
    className,
  )
}

export function AuthFormFooter({ variant }: AuthFormFooterProps) {
  if (variant === 'login') {
    return (
      <AuthFooterShell>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5 text-sm">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            Forgot password?
          </Link>
          <span
            className="hidden sm:block h-3.5 w-px bg-border-strong/80 shrink-0"
            aria-hidden="true"
          />
          <p className="text-text-muted text-center">
            New here?{' '}
            <Link to={ROUTES.REGISTER} className={accentLinkClassName()}>
              Create account
            </Link>
          </p>
        </div>
      </AuthFooterShell>
    )
  }

  if (variant === 'register') {
    return (
      <AuthFooterShell>
        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className={accentLinkClassName()}>
            Sign in
          </Link>
        </p>
      </AuthFooterShell>
    )
  }

  return (
    <AuthFooterShell>
      <div className="flex justify-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent-secondary transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AuthFooterShell>
  )
}

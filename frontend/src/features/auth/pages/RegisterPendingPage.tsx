import { Link, useSearchParams } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useResendVerification } from '@/features/auth/hooks/useAuth'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useState } from 'react'

export function RegisterPendingPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const reason = searchParams.get('reason')
  const isIpReverify = reason === 'ip'
  const [emailInput, setEmailInput] = useState(email)
  const resend = useResendVerification()
  const { toast } = useToast()

  const handleResend = async () => {
    if (!emailInput.trim()) {
      toast('Enter your email address', 'error')
      return
    }
    try {
      const result = await resend.mutateAsync({ email: emailInput.trim() })
      toast('Verification email sent if your account is pending.', 'success')
      if (result.devVerificationUrl) {
        console.info('[dev] Verification link:', result.devVerificationUrl)
        toast('Dev: check console for verification link', 'success')
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not resend verification email'
      toast(msg, 'error')
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Check your email"
        subtitle={
          isIpReverify
            ? 'Verify your email for this location'
            : 'We sent you a verification link'
        }
      />
      <CardContent className="px-6 pb-6 space-y-5">
        <p className="text-sm text-text-muted leading-relaxed">
          {isIpReverify ? (
            <>
              You are signing in from a new location. Click the link in the email we sent to
              verify this device before continuing.
            </>
          ) : (
            <>
              Click the link in the email to verify your account and receive your{' '}
              <span className="text-text-primary font-medium">1,000,000 virtual credits</span>.
              The link expires in 24 hours.
            </>
          )}
        </p>

        {email && (
          <p className="text-sm text-text-muted">
            Sent to <span className="font-medium text-text-primary">{email}</span>
          </p>
        )}

        <div className="rounded-lg border border-border-default bg-bg-elevated/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Didn&apos;t get the email?
          </p>
          <div>
            <Label htmlFor="resend-email">Email</Label>
            <Input
              id="resend-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            isLoading={resend.isPending}
            onClick={handleResend}
          >
            Resend verification email
          </Button>
        </div>

        <Link
          to={ROUTES.LOGIN}
          className="block text-center text-sm font-medium text-accent-secondary hover:underline"
        >
          Back to sign in
        </Link>
        <AuthFormFooter variant="back-to-login" />
      </CardContent>
    </AuthCard>
  )
}

import { type FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { loginSchema } from '@/features/auth/schemas/authSchemas'
import { syncAutofillToForm } from '@/features/auth/lib/syncAutofillToForm'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import {
  isTwoFactorChallenge,
  useVerifyTwoFactorLogin,
} from '@/features/settings/hooks/useTwoFactor'

import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'

type LoginForm = { email: string; password: string }

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useLogin()
  const verifyTwoFactor = useVerifyTwoFactorLogin()
  const { toast } = useToast()
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<{
    session: string
    method: 'authenticator' | 'phone'
    phoneNumberMasked: string | null
    email: string
  } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [trustDevice, setTrustDevice] = useState(true)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const completeLogin = () => {
    const redirect = params.get('redirect') ?? ROUTES.HOME
    navigate(redirect)
  }

  const submitLogin = handleSubmit(async (data) => {
    try {
      const result = await login.mutateAsync(data)
      if (isTwoFactorChallenge(result)) {
        setTwoFactorChallenge({
          session: result.twoFactorSession,
          method: result.method,
          phoneNumberMasked: result.phoneNumberMasked,
          email: data.email,
        })
        setTwoFactorCode('')
        return
      }
      completeLogin()
    } catch (e) {
      if (
        e instanceof ApiError &&
        (e.code === 'EMAIL_NOT_VERIFIED' || e.code === 'IP_VERIFICATION_REQUIRED')
      ) {
        const reason = e.code === 'IP_VERIFICATION_REQUIRED' ? 'ip' : 'email'
        navigate(
          `${ROUTES.REGISTER_PENDING}?email=${encodeURIComponent(data.email)}&reason=${reason}`,
          { replace: true },
        )
        if (e.code === 'IP_VERIFICATION_REQUIRED') {
          toast(e.message, 'error')
        }
        return
      }
      const msg = e instanceof ApiError ? e.message : 'Login failed'
      toast(msg, 'error')
    }
  })

  const submitTwoFactor = async () => {
    if (!twoFactorChallenge || twoFactorCode.length < 6) return
    try {
      await verifyTwoFactor.mutateAsync({
        session: twoFactorChallenge.session,
        code: twoFactorCode,
        trustDevice,
        email: twoFactorChallenge.email,
      })
      setTwoFactorChallenge(null)
      completeLogin()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Invalid verification code'
      toast(msg, 'error')
    }
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    syncAutofillToForm(event.currentTarget, [
      { id: 'login-email', name: 'email', trim: true },
      { id: 'login-password', name: 'password' },
    ], setValue)
    void submitLogin()
  }

  const backToCredentials = () => {
    setTwoFactorChallenge(null)
    setTwoFactorCode('')
  }

  if (twoFactorChallenge) {
    const isPhone = twoFactorChallenge.method === 'phone'
    return (
      <AuthCard>
        <AuthCardHeader
          title="Verify it's you"
          subtitle={
            isPhone
              ? `Enter the code sent to ${twoFactorChallenge.phoneNumberMasked ?? 'your phone'}`
              : 'Enter the code from your authenticator app'
          }
        />
        <CardContent className="px-6 pb-6 space-y-4">
          <div>
            <Label htmlFor="twofa-code">Verification code</Label>
            <Input
              id="twofa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
            />
            {isPhone && import.meta.env.DEV && (
              <p className="text-xs text-text-muted mt-1">Dev: check server console for SMS code</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="rounded border-border-default"
            />
            Trust this device for 30 days
          </label>
          <Button
            type="button"
            className="w-full"
            isLoading={verifyTwoFactor.isPending}
            disabled={twoFactorCode.length < 6}
            onClick={() => void submitTwoFactor()}
          >
            Verify & sign in
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={backToCredentials}>
            Back to sign in
          </Button>
        </CardContent>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthCardHeader title="Sign in" subtitle="Welcome back to the arena" />
      <CardContent className="px-6 pb-6">
        <SocialAuthButtons mode="login" />
        <AuthDivider label="Or continue with email" />
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={login.isPending}>Sign in</Button>
        </form>
        <AuthFormFooter variant="login" />
      </CardContent>
    </AuthCard>
  )
}

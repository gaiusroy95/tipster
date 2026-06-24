import { type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { checkEmailAvailable, checkUsernameAvailable, useRegister } from '@/features/auth/hooks/useAuth'
import { registerSchema } from '@/features/auth/schemas/authSchemas'
import { syncAutofillToForm } from '@/features/auth/lib/syncAutofillToForm'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements'

import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'

type RegisterForm = { displayName: string; username: string; email: string; password: string }

function pendingPath(email: string) {
  return `${ROUTES.REGISTER_PENDING}?email=${encodeURIComponent(email)}`
}

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { displayName: '', username: '', email: '', password: '' },
  })

  const password = watch('password') ?? ''

  const validateAvailability = async (field: 'username' | 'email', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    const valid = await trigger(field)
    if (!valid) return

    try {
      const available =
        field === 'username'
          ? await checkUsernameAvailable(trimmed)
          : await checkEmailAvailable(trimmed)

      if (!available) {
        setError(field, {
          type: 'manual',
          message:
            field === 'username' ? 'Username is already taken' : 'Email is already registered',
        })
      }
    } catch {
      // Availability check is best-effort; submit will enforce duplicates.
    }
  }

  const submitRegister = handleSubmit(async (data) => {
    try {
      const result = await registerMutation.mutateAsync(data)
      if (result.devVerificationUrl) {
        console.info('[dev] Verification link:', result.devVerificationUrl)
        toast('Dev: verification link logged to console', 'success')
      }
      navigate(pendingPath(result.email), { replace: true })
    } catch (e) {
      if (e instanceof ApiError && e.code === 'EMAIL_PENDING_VERIFICATION') {
        navigate(pendingPath(data.email), { replace: true })
        return
      }
      if (e instanceof ApiError && e.code === 'EMAIL_EXISTS') {
        setError('email', { type: 'manual', message: e.message })
        return
      }
      if (e instanceof ApiError && e.code === 'USERNAME_EXISTS') {
        setError('username', { type: 'manual', message: e.message })
        return
      }
      if (
        e instanceof ApiError &&
        (e.code === 'NETWORK_ERROR' || e.code === 'TIMEOUT')
      ) {
        navigate(pendingPath(data.email), { replace: true })
        toast(
          'Registration may have succeeded — check your email for the verification link.',
          'success',
        )
        return
      }
      const msg = e instanceof ApiError ? e.message : 'Registration failed'
      toast(msg, 'error')
    }
  })

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    syncAutofillToForm(event.currentTarget, [
      { id: 'displayName', name: 'displayName', trim: true },
      { id: 'username', name: 'username', trim: true },
      { id: 'email', name: 'email', trim: true },
      { id: 'password', name: 'password' },
    ], setValue)
    void submitRegister()
  }

  return (
    <AuthCard>
      <AuthCardHeader title="Create account" subtitle="Join the virtual tipster league" />
      <CardContent className="px-6 pb-6">
        <SocialAuthButtons mode="register" />
        <AuthDivider label="Or sign up with email" />
        <form onSubmit={onFormSubmit} className="space-y-4" autoComplete="off" noValidate>
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              autoComplete="off"
              placeholder="Alex Tipster"
              {...register('displayName')}
              error={errors.displayName?.message}
            />
            <FieldError message={errors.displayName?.message} />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="off"
              placeholder="alextipster"
              {...register('username', {
                onBlur: (e) => void validateAvailability('username', e.target.value),
              })}
              error={errors.username?.message}
            />
            <FieldError message={errors.username?.message} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="you@example.com"
              {...register('email', {
                onBlur: (e) => void validateAvailability('email', e.target.value),
              })}
              error={errors.email?.message}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register('password')}
              error={errors.password?.message}
            />
            <FieldError message={errors.password?.message} />
            <PasswordRequirements password={password} />
          </div>
          <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>Register</Button>
        </form>
        <AuthFormFooter variant="register" />
      </CardContent>
    </AuthCard>
  )
}

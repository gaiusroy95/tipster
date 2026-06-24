import { type FormEvent } from 'react'
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
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submitLogin = handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data)
      const redirect = params.get('redirect') ?? ROUTES.HOME
      navigate(redirect)
    } catch (e) {
      if (e instanceof ApiError && e.code === 'EMAIL_NOT_VERIFIED') {
        navigate(`${ROUTES.REGISTER_PENDING}?email=${encodeURIComponent(data.email)}`, {
          replace: true,
        })
        return
      }
      const msg = e instanceof ApiError ? e.message : 'Login failed'
      toast(msg, 'error')
    }
  })

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    syncAutofillToForm(event.currentTarget, [
      { id: 'login-email', name: 'email', trim: true },
      { id: 'login-password', name: 'password' },
    ], setValue)
    submitLogin(event)
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

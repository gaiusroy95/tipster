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
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demoplayer@example.com', password: 'password' },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data)
      const redirect = params.get('redirect') ?? ROUTES.HOME
      navigate(redirect)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Login failed'
      toast(msg, 'error')
    }
  })

  return (
    <AuthCard>
      <AuthCardHeader title="Sign in" subtitle="Welcome back to the arena" />
      <CardContent className="px-6 pb-6">
        <SocialAuthButtons mode="login" />
        <AuthDivider label="Or continue with email" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={login.isPending}>Sign in</Button>
        </form>
        <AuthFormFooter variant="login" />
      </CardContent>
    </AuthCard>
  )
}

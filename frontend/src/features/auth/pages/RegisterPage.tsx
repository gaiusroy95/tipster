import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useRegister } from '@/features/auth/hooks/useAuth'
import { registerSchema } from '@/features/auth/schemas/authSchemas'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'

import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons'
import { AuthDivider } from '@/features/auth/components/AuthDivider'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'

type RegisterForm = { displayName: string; username: string; email: string; password: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', username: '', email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await registerMutation.mutateAsync(data)
      if (result.devVerificationUrl) {
        console.info('[dev] Verification link:', result.devVerificationUrl)
      }
      navigate(`${ROUTES.REGISTER_PENDING}?email=${encodeURIComponent(result.email)}`, {
        replace: true,
      })
    } catch (e) {
      if (e instanceof ApiError && e.code === 'EMAIL_PENDING_VERIFICATION') {
        navigate(`${ROUTES.REGISTER_PENDING}?email=${encodeURIComponent(data.email)}`, {
          replace: true,
        })
        return
      }
      const msg = e instanceof ApiError ? e.message : 'Registration failed'
      toast(msg, 'error')
    }
  })

  return (
    <AuthCard>
      <AuthCardHeader title="Create account" subtitle="Join the virtual tipster league" />
      <CardContent className="px-6 pb-6">
        <SocialAuthButtons mode="register" />
        <AuthDivider label="Or sign up with email" />
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
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
              {...register('username')}
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
              {...register('email')}
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
              placeholder="At least 6 characters"
              {...register('password')}
              error={errors.password?.message}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>Register</Button>
        </form>
        <AuthFormFooter variant="register" />
      </CardContent>
    </AuthCard>
  )
}

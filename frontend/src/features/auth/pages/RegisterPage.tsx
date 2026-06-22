import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
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

type RegisterForm = { displayName: string; username: string; email: string; password: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerMutation.mutateAsync(data)
      toast('Welcome! You received 1,000,000 virtual credits.', 'success')
      navigate(ROUTES.HOME)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Registration failed'
      toast(msg, 'error')
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <SocialAuthButtons mode="register" />
        <AuthDivider label="Or sign up with email" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...register('displayName')} error={errors.displayName?.message} />
            <FieldError message={errors.displayName?.message} />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} error={errors.username?.message} />
            <FieldError message={errors.username?.message} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} error={errors.email?.message} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} error={errors.password?.message} />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>Register</Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          Already have an account? <Link to={ROUTES.LOGIN} className="text-accent-primary hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}

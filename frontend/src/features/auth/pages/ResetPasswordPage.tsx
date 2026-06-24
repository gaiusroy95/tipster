import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useResetPassword } from '@/features/auth/hooks/useAuth'
import { resetPasswordSchema } from '@/features/auth/schemas/authSchemas'
import { useToast } from '@/shared/components/ui/Toast'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCard } from '@/features/auth/components/AuthCard'

type ResetForm = { password: string; confirmPassword: string }

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')
  const reset = useResetPassword()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (!resetToken) {
      toast('Reset link is invalid or expired', 'error')
      return
    }
    await reset.mutateAsync({ token: resetToken, password: data.password })
    toast('Password reset successful', 'success')
    navigate(ROUTES.LOGIN)
  })

  if (!resetToken) {
    return (
      <AuthCard>
        <AuthCardHeader
          title="Reset password"
          subtitle="This reset link is invalid or has expired"
        />
        <CardContent className="px-6 pb-6 space-y-4">
          <p className="text-sm text-text-muted">
            Request a new link from the forgot password page.
          </p>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-medium text-accent-secondary hover:underline"
          >
            Request new reset link
          </Link>
          <AuthFormFooter variant="back-to-login" />
        </CardContent>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthCardHeader title="Reset password" subtitle="Choose a new password" />
      <CardContent className="px-6 pb-6">
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register('confirmPassword')}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={reset.isPending}>
            Reset password
          </Button>
        </form>
        <AuthFormFooter variant="back-to-login" />
      </CardContent>
    </AuthCard>
  )
}

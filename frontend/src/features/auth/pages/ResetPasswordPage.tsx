import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
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
  const reset = useResetPassword()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    await reset.mutateAsync({ token: 'mock-token', password: data.password })
    toast('Password reset successful', 'success')
    navigate(ROUTES.LOGIN)
  })

  return (
    <AuthCard>
      <AuthCardHeader title="Reset password" subtitle="Choose a new password" />
      <CardContent className="px-6 pb-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={reset.isPending}>Reset password</Button>
        </form>
        <AuthFormFooter variant="back-to-login" />
      </CardContent>
    </AuthCard>
  )
}

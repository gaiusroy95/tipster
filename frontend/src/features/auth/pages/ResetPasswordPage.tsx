import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useResetPassword } from '@/features/auth/hooks/useAuth'
import { resetPasswordSchema } from '@/features/auth/schemas/authSchemas'
import { useToast } from '@/shared/components/ui/Toast'

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
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
      </CardHeader>
      <CardContent>
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
        <p className="mt-4 text-center text-sm">
          <Link to={ROUTES.LOGIN} className="text-accent-primary hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}

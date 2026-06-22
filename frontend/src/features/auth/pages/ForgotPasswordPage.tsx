import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ROUTES } from '@/core/constants/routes'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'
import { forgotPasswordSchema } from '@/features/auth/schemas/authSchemas'
import { useToast } from '@/shared/components/ui/Toast'

type ForgotForm = { email: string }

export function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    await forgot.mutateAsync(data)
    toast('If the email exists, a reset link has been sent.', 'success')
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={forgot.isPending}>Send reset link</Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to={ROUTES.LOGIN} className="text-accent-primary hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}

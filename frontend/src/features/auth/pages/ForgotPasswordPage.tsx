import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardContent } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'
import { forgotPasswordSchema } from '@/features/auth/schemas/authSchemas'
import { useToast } from '@/shared/components/ui/Toast'
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'

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
    <AuthCard>
      <AuthCardHeader title="Forgot password" subtitle="We'll send you a reset link" />
      <CardContent className="px-6 pb-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={forgot.isPending}>Send reset link</Button>
        </form>
        <AuthFormFooter variant="back-to-login" />
      </CardContent>
    </AuthCard>
  )
}

import { useForm } from 'react-hook-form'
import { PageShell } from '@/shared/layouts/PageShell'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useUpdateProfile } from '@/features/settings/hooks/useSettings'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'

type ProfileForm = { displayName: string; username: string }

export function ProfileEditPage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      username: user?.username ?? '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfile.mutateAsync(data)
      toast('Profile updated', 'success')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Update failed'
      toast(msg, 'error')
    }
  })

  return (
    <PageShell title="Edit profile">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Profile information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...register('displayName', { required: 'Required' })} />
              <FieldError message={errors.displayName?.message} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register('username', { required: 'Required' })} />
              <FieldError message={errors.username?.message} />
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-text-muted mt-1">{user?.email}</p>
            </div>
            <Button type="submit" isLoading={updateProfile.isPending}>Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}

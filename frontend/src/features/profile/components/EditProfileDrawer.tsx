import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CameraIcon } from '@heroicons/react/24/outline'
import { RightSideDrawer } from '@/shared/components/ui/RightSideDrawer'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { PasswordInput } from '@/shared/components/ui/PasswordInput'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { PROFILE_COUNTRIES } from '@/features/profile/constants/countries'
import { useEditProfileDrawer } from '@/features/profile/context/EditProfileDrawerContext'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  useChangeEmail,
  useChangePassword,
  useUpdateProfile,
} from '@/features/settings/hooks/useSettings'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'
import { cn } from '@/shared/utils/cn'
import type { SignatureMode } from '@/mocks/data/types'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const SIGNATURE_POST_MIN = 30

interface FormState {
  username: string
  email: string
  country: string
  signatureMode: SignatureMode
  signature: string
  signatureLink: string
  currentPassword: string
  newPassword: string
  verifyPassword: string
}

function buildFormState(user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>): FormState {
  return {
    username: user.username,
    email: user.email,
    country: user.country ?? 'MY',
    signatureMode: user.signatureMode ?? 'text',
    signature: user.signature ?? '',
    signatureLink: user.signatureLink ?? '',
    currentPassword: '',
    newPassword: '',
    verifyPassword: '',
  }
}

export function EditProfileDrawer() {
  const { isOpen, close } = useEditProfileDrawer()
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const changeEmail = useChangeEmail()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [emailPanelOpen, setEmailPanelOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'newEmail' | 'emailPassword', string>>>({})
  const [saving, setSaving] = useState(false)

  const postCount = user?.postCount ?? 0
  const canUseSignature = postCount >= SIGNATURE_POST_MIN

  useEffect(() => {
    if (!isOpen || !user) return
    setForm(buildFormState(user))
    setAvatarPreview(user.avatarUrl)
    setAvatarRemoved(false)
    setEmailPanelOpen(false)
    setNewEmail('')
    setEmailPassword('')
    setErrors({})
  }, [isOpen, user])

  if (!user || !form) {
    return (
      <RightSideDrawer
        open={isOpen}
        onClose={close}
        onBack={close}
        title="Edit profile"
        widthClass="w-full sm:w-[min(440px,92vw)]"
      >
        <div className="p-6 text-sm text-text-muted">Sign in to edit your profile.</div>
      </RightSideDrawer>
    )
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast('Image must be 2 MB or smaller', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
      setAvatarRemoved(false)
    }
    reader.readAsDataURL(file)
  }

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.username.trim()) next.username = 'Username is required'
    if (form.newPassword || form.verifyPassword || form.currentPassword) {
      if (!form.currentPassword) next.currentPassword = 'Enter your current password'
      if (form.newPassword.length < 6) next.newPassword = 'At least 6 characters'
      if (form.newPassword !== form.verifyPassword) next.verifyPassword = 'Passwords do not match'
    }
    if (emailPanelOpen) {
      if (!newEmail.includes('@')) next.newEmail = 'Enter a valid email'
      if (emailPassword.length < 6) next.emailPassword = 'Enter your password to confirm'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (emailPanelOpen && newEmail !== user.email) {
        await changeEmail.mutateAsync({ email: newEmail.trim(), password: emailPassword })
      }

      if (form.currentPassword && form.newPassword) {
        await changePassword.mutateAsync({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        })
      }

      const avatarChanged = avatarRemoved || (avatarPreview !== user.avatarUrl)
      await updateProfile.mutateAsync({
        username: form.username.trim(),
        country: form.country,
        signatureMode: form.signatureMode,
        ...(canUseSignature
          ? { signature: form.signature.trim(), signatureLink: form.signatureLink.trim() }
          : {}),
        ...(avatarChanged
          ? { avatarUrl: avatarRemoved ? null : avatarPreview ?? null }
          : {}),
      })

      toast('Profile saved', 'success')
      close()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not save profile'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const isBusy = saving || updateProfile.isPending || changePassword.isPending || changeEmail.isPending

  return (
    <RightSideDrawer
      open={isOpen}
      onClose={close}
      onBack={close}
      title="Edit profile"
      widthClass="w-full sm:w-[min(440px,92vw)]"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={close} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" className="flex-1" isLoading={isBusy}>
            Save changes
          </Button>
        </div>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-6">
        <section className="flex flex-col items-center gap-3 pb-2">
          <div className="relative">
            <ProfileAvatar
              name={user.displayName}
              avatarUrl={avatarPreview}
              className="h-24 w-24 sm:h-28 sm:w-28 text-2xl"
            />
            <button
              type="button"
              onClick={handleAvatarPick}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-accent-secondary text-white shadow-md hover:opacity-90 transition-opacity"
              aria-label="Change profile photo"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleAvatarChange(e.target.files?.[0])}
          />
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleAvatarPick}
              className="font-semibold text-accent-secondary hover:underline"
            >
              Upload photo
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(undefined)
                  setAvatarRemoved(true)
                }}
                className="text-text-muted hover:text-accent-loss transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted text-center">JPG or PNG, max 2 MB</p>
        </section>

        <FieldGroup title="Account">
          <div>
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              autoComplete="username"
              error={errors.username}
            />
            <FieldError message={errors.username} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Label htmlFor="edit-email" className="mb-0">
                Email address
              </Label>
              <button
                type="button"
                onClick={() => setEmailPanelOpen((v) => !v)}
                className="text-xs font-semibold text-accent-secondary hover:underline shrink-0"
              >
                {emailPanelOpen ? 'Cancel change' : 'Change email'}
              </button>
            </div>
            <Input
              id="edit-email"
              type="email"
              value={emailPanelOpen ? newEmail || form.email : form.email}
              onChange={(e) => {
                if (emailPanelOpen) setNewEmail(e.target.value)
              }}
              readOnly={!emailPanelOpen}
              className={cn(!emailPanelOpen && 'opacity-80 cursor-default')}
            />
            {emailPanelOpen && (
              <div className="mt-3 space-y-3 rounded-xl border border-border-default bg-bg-elevated/40 p-3">
                <p className="text-xs text-text-muted">
                  Enter your new email and confirm with your current password.
                </p>
                <div>
                  <Label htmlFor="edit-new-email">New email</Label>
                  <Input
                    id="edit-new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value)
                      setErrors((prev) => ({ ...prev, newEmail: undefined }))
                    }}
                    placeholder="you@example.com"
                  />
                  <FieldError message={errors.newEmail} />
                </div>
                <div>
                  <Label htmlFor="edit-email-password">Current password</Label>
                  <PasswordInput
                    id="edit-email-password"
                    value={emailPassword}
                    onChange={(e) => {
                      setEmailPassword(e.target.value)
                      setErrors((prev) => ({ ...prev, emailPassword: undefined }))
                    }}
                    placeholder="Confirm with password"
                    autoComplete="current-password"
                  />
                  <FieldError message={errors.emailPassword} />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-country">Country</Label>
            <div className="relative">
              <select
                id="edit-country"
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-border-default bg-bg-elevated px-4 pr-10 text-base text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30"
              >
                {PROFILE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                ▾
              </span>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup title="Signature">
          <div className="inline-flex rounded-lg border border-border-default bg-bg-elevated/60 p-1 w-full sm:w-auto">
            {(['text', 'banner'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setField('signatureMode', mode)}
                className={cn(
                  'flex-1 sm:flex-none sm:min-w-[88px] rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors',
                  form.signatureMode === mode
                    ? 'bg-bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="edit-signature">
              {form.signatureMode === 'banner' ? 'Banner image URL' : 'Signature text'}
            </Label>
            {form.signatureMode === 'text' ? (
              <textarea
                id="edit-signature"
                value={form.signature}
                onChange={(e) => setField('signature', e.target.value)}
                placeholder="Enter up to two lines"
                rows={3}
                disabled={!canUseSignature}
                className={cn(
                  'w-full rounded-lg border border-border-default bg-bg-elevated px-4 py-3 text-base text-text-primary placeholder:text-text-muted resize-none',
                  'focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30',
                  !canUseSignature && 'opacity-50 cursor-not-allowed',
                )}
              />
            ) : (
              <Input
                id="edit-signature"
                value={form.signature}
                onChange={(e) => setField('signature', e.target.value)}
                placeholder="https://example.com/banner.png"
                disabled={!canUseSignature}
              />
            )}
          </div>

          <div>
            <Label htmlFor="edit-signature-link">Signature link</Label>
            <Input
              id="edit-signature-link"
              type="url"
              value={form.signatureLink}
              onChange={(e) => setField('signatureLink', e.target.value)}
              placeholder="https://your-link.com"
              disabled={!canUseSignature}
            />
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            {canUseSignature
              ? 'Your signature appears on forum posts and public comments.'
              : `Only members with more than ${SIGNATURE_POST_MIN} posts can add a signature. You have ${postCount} posts.`}
          </p>
        </FieldGroup>

        <FieldGroup title="Password">
          <p className="text-xs text-text-muted -mt-1 mb-1">
            Leave blank to keep your current password.
          </p>
          <div>
            <Label htmlFor="edit-current-password">Current password</Label>
            <PasswordInput
              id="edit-current-password"
              value={form.currentPassword}
              onChange={(e) => setField('currentPassword', e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <FieldError message={errors.currentPassword} />
          </div>
          <div>
            <Label htmlFor="edit-new-password">New password</Label>
            <PasswordInput
              id="edit-new-password"
              value={form.newPassword}
              onChange={(e) => setField('newPassword', e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <FieldError message={errors.newPassword} />
          </div>
          <div>
            <Label htmlFor="edit-verify-password">Verify password</Label>
            <PasswordInput
              id="edit-verify-password"
              value={form.verifyPassword}
              onChange={(e) => setField('verifyPassword', e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
            <FieldError message={errors.verifyPassword} />
          </div>
        </FieldGroup>
      </form>
    </RightSideDrawer>
  )
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-default/60 pb-2">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

import { useState } from 'react'
import {
  DevicePhoneMobileIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { SettingsSection } from '@/features/settings/components/SettingsSection'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { Badge } from '@/shared/components/ui/Badge'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'
import type { UserSettings } from '@/mocks/data/types'
import {
  useConfirmAuthenticator,
  useConfirmPhone,
  useDisableTwoFactor,
  useResendDisablePhoneCode,
  useSetupAuthenticator,
  useSetupPhone,
} from '@/features/settings/hooks/useTwoFactor'
import { cn } from '@/shared/utils/cn'

type SetupStep = 'idle' | 'choose' | 'authenticator' | 'phone' | 'disable'

interface TwoFactorSettingsCardProps {
  settings: UserSettings
  className?: string
}

export function TwoFactorSettingsCard({ settings, className }: TwoFactorSettingsCardProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<SetupStep>('idle')
  const [code, setCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; secret: string } | null>(null)

  const setupAuthenticator = useSetupAuthenticator()
  const confirmAuthenticator = useConfirmAuthenticator()
  const setupPhone = useSetupPhone()
  const confirmPhone = useConfirmPhone()
  const disableTwoFactor = useDisableTwoFactor()
  const resendDisableCode = useResendDisablePhoneCode()

  const resetFlow = () => {
    setStep('idle')
    setCode('')
    setPhoneNumber('')
    setPhoneCodeSent(false)
    setDisablePassword('')
    setDisableCode('')
    setQrData(null)
  }

  const handleStartAuthenticator = async () => {
    try {
      const result = await setupAuthenticator.mutateAsync()
      setQrData({ qrCodeUrl: result.qrCodeUrl, secret: result.secret })
      setStep('authenticator')
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not start authenticator setup', 'error')
    }
  }

  const handleConfirmAuthenticator = async () => {
    try {
      const result = await confirmAuthenticator.mutateAsync(code)
      toast(result.message, 'success')
      resetFlow()
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Invalid code', 'error')
    }
  }

  const handleSendPhoneCode = async () => {
    try {
      const result = await setupPhone.mutateAsync(phoneNumber)
      toast(result.devCodeHint ?? result.message, 'success')
      setPhoneCodeSent(true)
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not send verification code', 'error')
    }
  }

  const handleConfirmPhone = async () => {
    try {
      const result = await confirmPhone.mutateAsync(code)
      toast(result.message, 'success')
      resetFlow()
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Invalid code', 'error')
    }
  }

  const handleOpenDisable = async () => {
    setStep('disable')
    if (settings.twoFactorMethod === 'phone') {
      try {
        await resendDisableCode.mutateAsync()
        toast('Verification code sent (check server console in dev)', 'success')
      } catch {
        // non-blocking
      }
    }
  }

  const handleDisable = async () => {
    try {
      const result = await disableTwoFactor.mutateAsync({
        password: disablePassword,
        code: disableCode,
      })
      toast(result.message, 'success')
      resetFlow()
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not disable 2FA', 'error')
    }
  }

  const methodLabel =
    settings.twoFactorMethod === 'authenticator'
      ? 'Authenticator app'
      : settings.twoFactorMethod === 'phone'
        ? `Phone (${settings.phoneNumberMasked ?? 'verified'})`
        : null

  return (
    <SettingsSection
      className={className}
      icon={<ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />}
      title="Two-factor authentication"
      description="Add an extra verification step when signing in. Choose authenticator app or phone SMS."
      accent="secondary"
    >
      {settings.twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="win">Enabled</Badge>
            {methodLabel && (
              <span className="text-sm text-text-muted">{methodLabel}</span>
            )}
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            On trusted devices, you will not be asked again for 30 days after a successful verification.
          </p>
          {step !== 'disable' ? (
            <Button variant="secondary" size="sm" onClick={() => void handleOpenDisable()}>
              Disable 2FA
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-border-default/70 bg-bg-elevated/40 p-4">
              <p className="text-sm text-text-primary font-medium">Confirm to disable</p>
              <div>
                <Label htmlFor="disable-password">Password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="disable-code">
                  {settings.twoFactorMethod === 'phone' ? 'SMS code' : 'Authenticator code'}
                </Label>
                <Input
                  id="disable-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  isLoading={disableTwoFactor.isPending}
                  onClick={() => void handleDisable()}
                  disabled={disablePassword.length < 1 || disableCode.length < 6}
                >
                  Confirm disable
                </Button>
                {settings.twoFactorMethod === 'phone' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={resendDisableCode.isPending}
                    onClick={() => void resendDisableCode.mutateAsync().then(() => toast('Code resent', 'success'))}
                  >
                    Resend code
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={resetFlow}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {step === 'idle' && (
            <>
              <p className="text-sm text-text-muted leading-relaxed">
                Protect your account by requiring a verification code at sign-in. Set up either an authenticator app or phone SMS.
              </p>
              <Button onClick={() => setStep('choose')}>Enable 2FA</Button>
            </>
          )}

          {step === 'choose' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleStartAuthenticator()}
                disabled={setupAuthenticator.isPending}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border border-border-default/70 bg-bg-elevated/40 p-4 text-left transition-colors hover:border-accent-primary/40 hover:bg-accent-primary/5',
                )}
              >
                <KeyIcon className="h-6 w-6 text-accent-primary" aria-hidden="true" />
                <span className="font-medium text-text-primary">Authenticator app</span>
                <span className="text-xs text-text-muted">
                  Use Google Authenticator, Authy, or similar apps.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border border-border-default/70 bg-bg-elevated/40 p-4 text-left transition-colors hover:border-accent-secondary/40 hover:bg-accent-secondary/5',
                )}
              >
                <DevicePhoneMobileIcon className="h-6 w-6 text-accent-secondary" aria-hidden="true" />
                <span className="font-medium text-text-primary">Phone SMS</span>
                <span className="text-xs text-text-muted">
                  Receive a 6-digit code by text message.
                </span>
              </button>
              <Button variant="ghost" size="sm" className="sm:col-span-2" onClick={resetFlow}>
                Cancel
              </Button>
            </div>
          )}

          {step === 'authenticator' && qrData && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Scan this QR code with your authenticator app, then enter the 6-digit code below.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <img
                  src={qrData.qrCodeUrl}
                  alt="Authenticator QR code"
                  className="h-40 w-40 rounded-lg border border-border-default bg-white p-2"
                />
                <div className="min-w-0 text-xs text-text-muted break-all">
                  <p className="font-medium text-text-primary mb-1">Manual entry key</p>
                  <code className="select-all">{qrData.secret}</code>
                </div>
              </div>
              <div>
                <Label htmlFor="auth-code">Verification code</Label>
                <Input
                  id="auth-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <FieldError message={code.length > 0 && code.length < 6 ? 'Enter 6 digits' : undefined} />
              </div>
              <div className="flex gap-2">
                <Button
                  isLoading={confirmAuthenticator.isPending}
                  disabled={code.length < 6}
                  onClick={() => void handleConfirmAuthenticator()}
                >
                  Verify & enable
                </Button>
                <Button variant="ghost" onClick={resetFlow}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-4">
              {!phoneCodeSent ? (
                <>
                  <div>
                    <Label htmlFor="phone-number">Phone number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+15551234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-text-muted mt-1">Use E.164 format, e.g. +15551234567</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      isLoading={setupPhone.isPending}
                      disabled={phoneNumber.trim().length < 8}
                      onClick={() => void handleSendPhoneCode()}
                    >
                      Send code
                    </Button>
                    <Button variant="ghost" onClick={resetFlow}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-text-muted">
                    Enter the 6-digit code sent to your phone.
                    {import.meta.env.DEV && ' Check the server console in development.'}
                  </p>
                  <div>
                    <Label htmlFor="phone-code">Verification code</Label>
                    <Input
                      id="phone-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      isLoading={confirmPhone.isPending}
                      disabled={code.length < 6}
                      onClick={() => void handleConfirmPhone()}
                    >
                      Verify & enable
                    </Button>
                    <Button variant="ghost" onClick={resetFlow}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </SettingsSection>
  )
}

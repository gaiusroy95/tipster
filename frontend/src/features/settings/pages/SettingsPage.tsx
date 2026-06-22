import { PageShell } from '@/shared/layouts/PageShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'

import { ConnectedAccountsCard } from '@/features/settings/components/ConnectedAccountsCard'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-3 min-h-[44px] text-left"
    >
      <div>
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      <div
        className={cn(
          'w-11 h-6 rounded-full transition-colors relative',
          checked ? 'bg-accent-primary' : 'bg-bg-elevated border border-border-default',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </div>
    </button>
  )
}

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings()
  const updateSettings = useUpdateSettings()
  const { toast } = useToast()

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [key]: value })
      toast('Settings updated', 'success')
    } catch {
      toast('Failed to update settings', 'error')
    }
  }

  if (isLoading) {
    return (
      <PageShell title="Settings">
        <Skeleton className="h-48 w-full max-w-lg" />
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell title="Settings">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Settings">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border-default">
          <Toggle
            label="Email notifications"
            description="Receive bet results and season updates by email (future)"
            checked={data.emailNotifications}
            onChange={(v) => handleToggle('emailNotifications', v)}
          />
          <Toggle
            label="Push notifications"
            description="Mobile push alerts (future)"
            checked={data.pushNotifications}
            onChange={(v) => handleToggle('pushNotifications', v)}
          />
        </CardContent>
      </Card>

      <ConnectedAccountsCard />

      <Card className="max-w-lg mt-6">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <Toggle
            label="Public profile"
            description="Allow others to view your transparency profile"
            checked={data.showProfilePublic}
            onChange={(v) => handleToggle('showProfilePublic', v)}
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}

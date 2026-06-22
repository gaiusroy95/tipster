import {
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { PageShell } from '@/shared/layouts/PageShell'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings'
import { useLinkedAccounts } from '@/features/auth/hooks/useSocialAuth'
import { useToast } from '@/shared/components/ui/Toast'
import { ConnectedAccountsCard } from '@/features/settings/components/ConnectedAccountsCard'
import { SettingsOverview } from '@/features/settings/components/SettingsOverview'
import { SettingsSection } from '@/features/settings/components/SettingsSection'
import { SettingsToggle } from '@/features/settings/components/SettingsToggle'

function SettingsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useSettings()
  const { data: linkedData } = useLinkedAccounts()
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
      <PageShell title="Settings" description="Manage notifications, privacy, and sign-in options">
        <SettingsSkeleton />
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

  const linkedAccountCount = linkedData?.accounts.length ?? 0

  return (
    <PageShell
      title="Settings"
      description="Manage notifications, privacy, and sign-in options"
      className="pb-24 xl:pb-6"
    >
      <div className="space-y-5">
        <SettingsOverview settings={data} linkedAccountCount={linkedAccountCount} />

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <SettingsSection
              icon={<BellIcon className="h-5 w-5" aria-hidden="true" />}
              title="Notifications"
              description="Choose how Tipster Arena reaches you about bets and seasons."
              accent="primary"
            >
              <div className="space-y-2">
                <SettingsToggle
                  label="Email notifications"
                  description="Receive bet results and season updates by email (future)"
                  checked={data.emailNotifications}
                  onChange={(v) => handleToggle('emailNotifications', v)}
                />
                <SettingsToggle
                  label="Push notifications"
                  description="Mobile push alerts for live results and reminders (future)"
                  checked={data.pushNotifications}
                  onChange={(v) => handleToggle('pushNotifications', v)}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />}
              title="Privacy"
              description="Control what other players can see on your profile."
              accent="gold"
            >
              <SettingsToggle
                label="Public profile"
                description="Allow others to view your transparency profile, stats, and bet history."
                checked={data.showProfilePublic}
                onChange={(v) => handleToggle('showProfilePublic', v)}
              />
            </SettingsSection>
          </div>

          <ConnectedAccountsCard />
        </div>
      </div>
    </PageShell>
  )
}

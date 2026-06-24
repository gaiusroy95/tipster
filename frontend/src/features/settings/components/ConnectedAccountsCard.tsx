import { useState } from 'react'
import { LinkIcon } from '@heroicons/react/24/outline'
import { SOCIAL_PROVIDERS } from '@/core/constants/socialProviders'
import { initiateSocialAuth } from '@/features/auth/lib/socialAuth'
import {
  useLinkedAccounts,
  useUnlinkSocialAccount,
} from '@/features/auth/hooks/useSocialAuth'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'
import { SocialProviderIcon } from '@/features/auth/components/SocialProviderIcon'
import { SettingsSection } from '@/features/settings/components/SettingsSection'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'
import { cn } from '@/shared/utils/cn'

export function ConnectedAccountsCard({ className }: { className?: string }) {
  const { data, isLoading, isError, refetch } = useLinkedAccounts()
  const unlink = useUnlinkSocialAccount()
  const { toast } = useToast()
  const [connectingProvider, setConnectingProvider] = useState<SocialAuthProvider | null>(null)

  const handleConnect = async (provider: SocialAuthProvider) => {
    try {
      setConnectingProvider(provider)
      await initiateSocialAuth(provider, 'link')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not connect account'
      toast(msg, 'error')
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (provider: SocialAuthProvider) => {
    try {
      await unlink.mutateAsync(provider)
      toast('Social account disconnected', 'success')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not disconnect account'
      toast(msg, 'error')
    }
  }

  if (isLoading) {
    return <Skeleton className={cn('h-72 w-full rounded-2xl', className)} />
  }

  if (isError || !data) {
    return <QueryErrorFallback onRetry={() => refetch()} />
  }

  const linkedProviders = new Set(data.accounts.map((a) => a.provider))

  return (
    <SettingsSection
      className={className}
      icon={<LinkIcon className="h-5 w-5" aria-hidden="true" />}
      title="Connected accounts"
      description="Link social accounts for faster sign-in. Email and password sign-in stays available."
      accent="gold"
    >
      <div className="space-y-2">
        {SOCIAL_PROVIDERS.map((provider) => {
          const linked = linkedProviders.has(provider.id)
          const account = data.accounts.find((a) => a.provider === provider.id)
          const isConnecting = connectingProvider === provider.id
          const isDisconnecting = unlink.isPending && unlink.variables === provider.id
          const statusLabel = linked ? account?.email ?? 'Connected' : 'Not connected'

          return (
            <div
              key={provider.id}
              className={cn(
                'flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
                linked
                  ? 'border-accent-secondary/25 bg-accent-secondary/5'
                  : 'border-border-default/70 bg-bg-elevated/40',
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm',
                    provider.id === 'google' && 'bg-white border-border-default',
                    provider.id === 'facebook' && 'bg-[#1877F2] text-white border-[#1877F2]',
                    provider.id === 'apple' && 'bg-black text-white border-black',
                  )}
                >
                  <SocialProviderIcon provider={provider.id} className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{provider.name}</p>
                    {linked ? (
                      <Badge variant="win" className="text-[10px] px-2 py-0">Connected</Badge>
                    ) : (
                      <Badge variant="muted" className="text-[10px] px-2 py-0">Not linked</Badge>
                    )}
                  </div>
                  <p
                    className="mt-0.5 truncate text-sm text-text-muted"
                    title={linked ? statusLabel : undefined}
                  >
                    {statusLabel}
                  </p>
                </div>
              </div>
              {linked ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  isLoading={isDisconnecting}
                  onClick={() => handleDisconnect(provider.id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  isLoading={isConnecting}
                  onClick={() => handleConnect(provider.id)}
                >
                  Connect
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </SettingsSection>
  )
}

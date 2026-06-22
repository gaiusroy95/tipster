import { useState } from 'react'
import { SOCIAL_PROVIDERS } from '@/core/constants/socialProviders'
import { initiateSocialAuth } from '@/features/auth/lib/socialAuth'
import {
  useLinkedAccounts,
  useUnlinkSocialAccount,
} from '@/features/auth/hooks/useSocialAuth'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'
import { SocialProviderIcon } from '@/features/auth/components/SocialProviderIcon'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'
import { cn } from '@/shared/utils/cn'

export function ConnectedAccountsCard() {
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
    return <Skeleton className="h-48 w-full max-w-lg" />
  }

  if (isError || !data) {
    return <QueryErrorFallback onRetry={() => refetch()} />
  }

  const linkedProviders = new Set(data.accounts.map((a) => a.provider))

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-text-muted">
          Link social accounts for faster sign-in. Email and password sign-in remains available when linked.
        </p>
        {SOCIAL_PROVIDERS.map((provider) => {
          const linked = linkedProviders.has(provider.id)
          const account = data.accounts.find((a) => a.provider === provider.id)
          const isConnecting = connectingProvider === provider.id
          const isDisconnecting = unlink.isPending && unlink.variables === provider.id

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border-default bg-bg-elevated px-3 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    provider.id === 'google' && 'bg-white border border-border-default',
                    provider.id === 'facebook' && 'bg-[#1877F2] text-white',
                    provider.id === 'apple' && 'bg-black text-white',
                  )}
                >
                  <SocialProviderIcon provider={provider.id} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-text-muted truncate">
                    {linked ? account?.email ?? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              {linked ? (
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isDisconnecting}
                  onClick={() => handleDisconnect(provider.id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isConnecting}
                  onClick={() => handleConnect(provider.id)}
                >
                  Connect
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

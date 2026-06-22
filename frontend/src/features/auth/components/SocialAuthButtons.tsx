import { useState } from 'react'
import { SOCIAL_PROVIDERS } from '@/core/constants/socialProviders'
import { initiateSocialAuth } from '@/features/auth/lib/socialAuth'
import type { SocialAuthMode, SocialAuthProvider } from '@/features/auth/types/socialAuth'
import { SocialProviderIcon } from '@/features/auth/components/SocialProviderIcon'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'

export function SocialAuthButtons({ mode }: { mode: SocialAuthMode }) {
  const { toast } = useToast()
  const [loadingProvider, setLoadingProvider] = useState<SocialAuthProvider | null>(null)

  const handleClick = async (provider: SocialAuthProvider) => {
    try {
      setLoadingProvider(provider)
      await initiateSocialAuth(provider, mode)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not start social sign-in'
      toast(msg, 'error')
      setLoadingProvider(null)
    }
  }

  const actionLabel = mode === 'register' ? 'Sign up' : 'Continue'

  return (
    <div className="space-y-3">
      {SOCIAL_PROVIDERS.map((provider) => {
        const isLoading = loadingProvider === provider.id
        const isDisabled = loadingProvider !== null

        return (
          <button
            key={provider.id}
            type="button"
            disabled={isDisabled}
            onClick={() => handleClick(provider.id)}
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity min-h-[44px]',
              provider.buttonClass,
              isDisabled && !isLoading && 'opacity-50',
            )}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <SocialProviderIcon provider={provider.id} className="h-5 w-5 shrink-0" />
            )}
            <span>{actionLabel} with {provider.name}</span>
          </button>
        )
      })}
    </div>
  )
}

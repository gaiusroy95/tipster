import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'

export interface SocialProviderConfig {
  id: SocialAuthProvider
  name: string
  buttonClass: string
}

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    buttonClass: 'bg-white text-gray-800 border border-border-default hover:bg-gray-50',
  },
]

export const ALL_SOCIAL_PROVIDERS: SocialAuthProvider[] = SOCIAL_PROVIDERS.map((p) => p.id)

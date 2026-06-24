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
  {
    id: 'facebook',
    name: 'Facebook',
    buttonClass: 'bg-[#1877F2] text-white border border-[#1877F2] hover:bg-[#166FE5]',
  },
]

export const ALL_SOCIAL_PROVIDERS: SocialAuthProvider[] = SOCIAL_PROVIDERS.map((p) => p.id)

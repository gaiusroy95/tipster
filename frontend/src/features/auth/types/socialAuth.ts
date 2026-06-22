export type SocialAuthProvider = 'google' | 'facebook' | 'apple'

export type SocialAuthMode = 'login' | 'register' | 'link'

export interface LinkedSocialAccount {
  provider: SocialAuthProvider
  email?: string
  linkedAt: string
}

export interface OAuthUrlResponse {
  url: string
}

export interface SocialAuthResponse {
  user: import('@/mocks/data/types').User
  token: string
  isNewUser: boolean
}

export interface LinkedAccountsResponse {
  accounts: LinkedSocialAccount[]
  availableProviders: SocialAuthProvider[]
}

import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'

export function SocialProviderIcon({ provider, className }: { provider: SocialAuthProvider; className?: string }) {
  if (provider === 'google') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a4.78 4.78 0 0 1-2.04 3.12v2.66h3.32a9.52 9.52 0 0 0 2.8-7.46z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.32-2.66a5.78 5.78 0 0 1-8.59-3.04h-3.36v2.76A11.001 11.001 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.08 14.09a6.52 6.52 0 0 1 0-3.18V8.07H1.68a11 11 0 0 0 0 9.86l3.4-2.76z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38a5.78 5.78 0 0 1 4.56 2.08l2.66-2.66A9.93 9.93 0 0 0 12 2C7.4 2 3.34 4.26 1.68 8.07l3.4 2.76A6.52 6.52 0 0 1 12 4.75z"
        />
      </svg>
    )
  }

  if (provider === 'facebook') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.8v8.385C19.612 23.08 24 18.115 24 12.073z" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

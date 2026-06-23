export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  sportsApiUrl: import.meta.env.VITE_SPORTS_API_URL ?? 'http://localhost:3000',
  enableMsw: import.meta.env.VITE_ENABLE_MSW === 'true',
  isDev: import.meta.env.DEV,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID ?? '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
}

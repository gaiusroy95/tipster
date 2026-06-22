export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  enableMsw: import.meta.env.VITE_ENABLE_MSW === 'true',
  isDev: import.meta.env.DEV,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID ?? '',
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
}

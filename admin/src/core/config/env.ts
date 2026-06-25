function normalizeApiBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? '/api').trim().replace(/\/+$/, '')
  if (!trimmed) return '/api'
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }
  if (trimmed.endsWith('/api')) return trimmed
  return `${trimmed}/api`
}

export const env = {
  apiUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  isDev: import.meta.env.DEV,
}

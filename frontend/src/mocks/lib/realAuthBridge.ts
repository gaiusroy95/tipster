import type { User } from '@/mocks/data/types'

const AUTH_ME_URL = 'http://127.0.0.1:3000/api/auth/me'

function decodeJwtSub(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload.padEnd(payload.length + ((4 - payload.length % 4) % 4), '=')
    const decoded = JSON.parse(atob(padded)) as { sub?: string }
    return typeof decoded.sub === 'string' ? decoded.sub : null
  } catch {
    return null
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  if (!token) return null
  return decodeJwtSub(token)
}

export async function fetchRealAuthUser(request: Request): Promise<User | null> {
  const auth = request.headers.get('Authorization')
  if (!auth) return null

  try {
    const response = await fetch(AUTH_ME_URL, {
      headers: { Authorization: auth, Accept: 'application/json' },
    })
    if (!response.ok) return null
    const body = (await response.json()) as { data?: User }
    return body.data ?? null
  } catch {
    return null
  }
}

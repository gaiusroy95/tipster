const TRUST_STORAGE_KEY = 'tipster_2fa_trust'

function readTrustMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TRUST_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function getTwoFactorTrustToken(email: string): string | undefined {
  const map = readTrustMap()
  return map[email.trim().toLowerCase()]
}

export function saveTwoFactorTrustToken(email: string, token: string): void {
  const map = readTrustMap()
  map[email.trim().toLowerCase()] = token
  localStorage.setItem(TRUST_STORAGE_KEY, JSON.stringify(map))
}

export function clearTwoFactorTrustToken(email: string): void {
  const map = readTrustMap()
  delete map[email.trim().toLowerCase()]
  localStorage.setItem(TRUST_STORAGE_KEY, JSON.stringify(map))
}

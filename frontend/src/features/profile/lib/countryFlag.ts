/** Regional indicator flag emoji from ISO 3166-1 alpha-2 country code. */
export function countryFlagEmoji(code?: string): string | null {
  if (!code || code.length !== 2 || code === 'OTHER') return null
  const upper = code.toUpperCase()
  if (!/^[A-Z]{2}$/.test(upper)) return null
  const points = [...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...points)
}

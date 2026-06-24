/**
 * Normalizes Google profile photo URLs for reliable display (HTTPS, consistent size).
 */
export function normalizeGooglePictureUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;

  let normalized = url.trim();
  if (normalized.startsWith('http://')) {
    normalized = `https://${normalized.slice(7)}`;
  }

  if (!normalized.includes('googleusercontent.com')) {
    return normalized;
  }

  const base = normalized.replace(/=s\d+(-c)?$/, '');
  return `${base}=s256-c`;
}

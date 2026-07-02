import { randomBytes } from 'node:crypto';

/** Alphanumeric username slug for ticket IDs (max 16 chars). */
export function sanitizeUsernameForTicket(username: string): string {
  const cleaned = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return (cleaned || 'player').slice(0, 16).toUpperCase();
}

export function formatTicketTimestamp(date: Date): { date: string; time: string } {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return { date: `${y}${m}${d}`, time: `${h}${min}` };
}

/**
 * Human-readable bet ticket, e.g. TA-JACOB1101-20260701-1430-A7K3
 * Username segment makes admin search by tipster easy.
 */
export function generateTicketReference(username: string, placedAt: Date = new Date()): string {
  const user = sanitizeUsernameForTicket(username);
  const { date, time } = formatTicketTimestamp(placedAt);
  const suffix = randomBytes(2).toString('hex').toUpperCase();
  return `TA-${user}-${date}-${time}-${suffix}`;
}

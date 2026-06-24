import { config } from 'dotenv';
import { resolve } from 'node:path';
import dns from 'node:dns';

config({ path: resolve(process.cwd(), '.env') });

/** Prefer IPv4 when calling Google OAuth (avoids hangs on some Windows networks). */
dns.setDefaultResultOrder('ipv4first');

/**
 * `channel_binding=require` breaks Prisma / node-postgres on many Windows setups.
 * Neon pooler URLs should use `?sslmode=require` only.
 */
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('channel_binding');
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '30');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '30');
    }
    return parsed.href;
  } catch {
    return url;
  }
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

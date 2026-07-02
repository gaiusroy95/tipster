/**
 * Neon pooler URLs cannot run Prisma migrations (no advisory locks).
 * Derive a direct connection string by removing "-pooler" from the host.
 */
export function normalizeDatabaseUrl(url) {
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

export function toDirectDatabaseUrl(poolUrl) {
  if (!poolUrl) return poolUrl;

  try {
    const parsed = new URL(poolUrl);
    parsed.hostname = parsed.hostname.replace('-pooler', '');
    parsed.searchParams.delete('channel_binding');
    parsed.searchParams.delete('pgbouncer');
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '60');
    }
    return parsed.href;
  } catch {
    return poolUrl;
  }
}

export function ensurePrismaDatabaseEnv(env = process.env) {
  const databaseUrl = normalizeDatabaseUrl(env.DATABASE_URL);
  if (databaseUrl) {
    env.DATABASE_URL = databaseUrl;
  }

  if (!env.DIRECT_DATABASE_URL?.trim() && databaseUrl) {
    env.DIRECT_DATABASE_URL = toDirectDatabaseUrl(databaseUrl);
  } else if (env.DIRECT_DATABASE_URL) {
    env.DIRECT_DATABASE_URL = normalizeDatabaseUrl(env.DIRECT_DATABASE_URL);
  }

  if (!env.PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT) {
    env.PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT = '60000';
  }

  return env;
}

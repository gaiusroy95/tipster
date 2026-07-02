import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ensurePrismaDatabaseEnv } from './database-url.mjs';

config({ path: resolve(process.cwd(), '.env') });
ensurePrismaDatabaseEnv(process.env);

function runPrisma(args, { capture = false } = {}) {
  const result = spawnSync('npx', ['prisma', ...args], {
    env: process.env,
    encoding: 'utf8',
    shell: true,
    stdio: capture ? 'pipe' : 'inherit',
  });
  return {
    status: result.status ?? 1,
    output: capture ? `${result.stdout ?? ''}${result.stderr ?? ''}` : '',
  };
}

function directHostLabel() {
  try {
    return new URL(process.env.DIRECT_DATABASE_URL ?? '').hostname;
  } catch {
    return '(direct connection)';
  }
}

const status = runPrisma(['migrate', 'status'], { capture: true });

if (status.status !== 0) {
  console.error(status.output);
  process.exit(status.status);
}

if (status.output.includes('Database schema is up to date')) {
  console.log('[prisma:deploy] Database schema is up to date. No migrations to apply.');
  process.exit(0);
}

console.log(`[prisma:deploy] Pending migrations — applying via ${directHostLabel()}`);

const maxAttempts = 5;
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  if (attempt > 1) {
    const waitMs = attempt * 5000;
    console.log(
      `[prisma:deploy] Migration lock busy — retry ${attempt}/${maxAttempts} in ${waitMs / 1000}s…`,
    );
    console.log(
      '[prisma:deploy] Stop local `npm run start:dev`, close Prisma Studio, and wait if Render is deploying.',
    );
    await new Promise((resolveDelay) => setTimeout(resolveDelay, waitMs));
  }

  const deploy = runPrisma(['migrate', 'deploy']);
  if (deploy.status === 0) {
    process.exit(0);
  }
}

console.error(
  '[prisma:deploy] Could not acquire the migration lock. Another session is using the database.',
);
console.error('Run `npm run free-port` to stop the local API, then try again in a minute.');
process.exit(1);

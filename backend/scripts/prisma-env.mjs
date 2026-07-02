import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ensurePrismaDatabaseEnv } from './database-url.mjs';

config({ path: resolve(process.cwd(), '.env') });

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/prisma-env.mjs <prisma-subcommand> [...args]');
  process.exit(1);
}

ensurePrismaDatabaseEnv(process.env);

if (args[0] === 'migrate' && args[1] === 'deploy') {
  const directHost = (() => {
    try {
      return new URL(process.env.DIRECT_DATABASE_URL ?? '').hostname;
    } catch {
      return '(direct connection)';
    }
  })();
  console.log(`[prisma] migrate deploy via direct host: ${directHost}`);
}

const result = spawnSync('npx', ['prisma', ...args], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);

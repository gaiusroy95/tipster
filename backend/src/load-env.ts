import { config } from 'dotenv';
import { resolve } from 'node:path';
import dns from 'node:dns';
import { ensurePrismaDatabaseEnv } from '../scripts/database-url.mjs';

config({ path: resolve(process.cwd(), '.env') });

/** Prefer IPv4 when calling Google OAuth (avoids hangs on some Windows networks). */
dns.setDefaultResultOrder('ipv4first');

ensurePrismaDatabaseEnv(process.env);

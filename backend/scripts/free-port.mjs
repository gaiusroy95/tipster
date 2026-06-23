/**
 * Free a TCP port on Windows before starting the dev server.
 * Used by npm prestart:dev (cmd) — avoids Git Bash `taskkill /PID` path issues.
 */
import { execSync } from 'node:child_process';

const port = Number(process.env.PORT ?? process.argv[2] ?? 3000);

if (!Number.isFinite(port) || port <= 0) {
  console.error('Invalid port:', port);
  process.exit(1);
}

function findListeningPids(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const pids = new Set();
    for (const line of output.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    return pids;
  } catch {
    return new Set();
  }
}

const pids = findListeningPids(port);

if (pids.size === 0) {
  console.log(`[free-port] Port ${port} is free.`);
  process.exit(0);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
    console.log(`[free-port] Stopped PID ${pid} (was listening on port ${port}).`);
  } catch {
    console.warn(`[free-port] Could not stop PID ${pid}.`);
  }
}

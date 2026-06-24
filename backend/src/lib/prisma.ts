import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001') {
    return true;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("Can't reach database server") ||
      error.message.includes('Connection terminated') ||
      error.message.includes('connection timeout')
    );
  }
  return false;
}

export async function connectPrisma(maxAttempts = 6): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      if (attempt > 1) {
        console.log(`[db] Connected to PostgreSQL (attempt ${attempt})`);
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delayMs = attempt * 2000;
        console.warn(
          `[db] PostgreSQL connection failed (attempt ${attempt}/${maxAttempts}). ` +
            `Retrying in ${delayMs / 1000}s... (Neon may be waking from sleep)`,
        );
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

export async function reconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore disconnect errors on a dead connection
  }
  await connectPrisma(4);
}

/** Retry DB work when Neon pooler drops idle connections (common P1001). */
export async function withDbRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isPrismaConnectionError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const delayMs = attempt * 1500;
      console.warn(
        `[db] Query failed (attempt ${attempt}/${maxAttempts}). Reconnecting in ${delayMs / 1000}s...`,
      );
      await sleep(delayMs);
      await reconnectPrisma();
    }
  }

  throw lastError;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

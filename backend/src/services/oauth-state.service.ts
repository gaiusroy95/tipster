import { randomBytes } from 'node:crypto';
import type { OAuthProvider } from '../auth/auth.constants';
import { prisma, withDbRetry } from '../lib/prisma';

export type OAuthMode = 'login' | 'register' | 'link';

export interface OAuthStateRecord {
  provider: OAuthProvider;
  mode: OAuthMode;
  redirectUri: string;
  userId?: string;
  expiresAt: number;
}

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export const oauthStateService = {
  async create(
    provider: OAuthProvider,
    mode: OAuthMode,
    redirectUri: string,
    userId?: string,
  ): Promise<string> {
    const state = randomBytes(24).toString('base64url');
    const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);

    await withDbRetry(() =>
      prisma.oAuthState.create({
        data: {
          state,
          provider,
          mode,
          redirectUri,
          userId,
          expiresAt,
        },
      }),
    );

    return state;
  },

  /** Validate OAuth state without deleting — allows DB retries before Google code is consumed. */
  async validate(state: string): Promise<OAuthStateRecord | null> {
    return withDbRetry(async () => {
      const record = await prisma.oAuthState.findUnique({ where: { state } });
      if (!record) return null;
      if (record.expiresAt < new Date()) {
        await prisma.oAuthState.delete({ where: { state } }).catch(() => undefined);
        return null;
      }

      return {
        provider: record.provider as OAuthProvider,
        mode: record.mode as OAuthMode,
        redirectUri: record.redirectUri,
        userId: record.userId ?? undefined,
        expiresAt: record.expiresAt.getTime(),
      };
    });
  },

  async delete(state: string): Promise<void> {
    await withDbRetry(() =>
      prisma.oAuthState.delete({ where: { state } }).catch(() => undefined),
    );
  },
};

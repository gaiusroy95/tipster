import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AUTH_PROVIDER_EMAIL, INITIAL_BALANCE } from '../auth/auth.constants';
import { leaderboardService } from './leaderboard.service';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export const usersService = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username: normalizeUsername(username) } });
  },

  async isEmailAvailable(email: string): Promise<boolean> {
    const existing = await this.findByEmail(email);
    return !existing;
  },

  async isUsernameAvailable(username: string): Promise<boolean> {
    const existing = await this.findByUsername(username);
    return !existing;
  },

  async createWithEmailAuth(data: {
    email: string;
    username: string;
    displayName: string;
    passwordHash: string;
    emailVerifiedAt?: Date | null;
    registrationIp?: string | null;
  }): Promise<User> {
    const username = normalizeUsername(data.username);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          username,
          displayName: data.displayName,
          passwordHash: data.passwordHash,
          emailVerifiedAt: data.emailVerifiedAt ?? null,
          registrationIp: data.registrationIp ?? null,
          verifiedIp: null,
          balance: INITIAL_BALANCE,
          rank: 0,
          authProviders: [AUTH_PROVIDER_EMAIL],
          primaryAuthProvider: AUTH_PROVIDER_EMAIL,
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: 'initial',
          amount: INITIAL_BALANCE,
          balanceAfter: INITIAL_BALANCE,
          description: 'Welcome bonus — initial virtual credits',
        },
      });

      await tx.userSettings.create({
        data: { userId: user.id },
      });

      return user;
    }).then((user) => {
      void leaderboardService.enrollUserInActiveSeason(user.id).catch((error) => {
        console.error('[leaderboard] enroll on register failed:', error);
      });
      return user;
    });
  },
};

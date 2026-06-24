import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AUTH_PROVIDER_EMAIL, INITIAL_BALANCE } from '../auth/auth.constants';
import { leaderboardService } from './leaderboard.service';

export const usersService = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  },

  async createWithEmailAuth(data: {
    email: string;
    username: string;
    displayName: string;
    passwordHash: string;
    emailVerifiedAt?: Date | null;
  }): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          username: data.username,
          displayName: data.displayName,
          passwordHash: data.passwordHash,
          emailVerifiedAt: data.emailVerifiedAt ?? null,
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
    }).then(async (user) => {
      await leaderboardService.enrollUserInActiveSeason(user.id);
      return user;
    });
  },
};

import * as bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { AUTH_PROVIDER_EMAIL, INITIAL_BALANCE } from '../../auth/auth.constants';

const BCRYPT_ROUNDS = 12;

export const adminBootstrapService = {
  async ensureAdminAccount(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD?.trim();

    if (!email || !password) {
      console.warn(
        '[admin] ADMIN_EMAIL and ADMIN_PASSWORD not set — skipping admin bootstrap',
      );
      return;
    }

    const username = (process.env.ADMIN_USERNAME?.trim() || 'admin').toLowerCase();
    const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || 'Platform Admin';

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            role: 'ADMIN',
            emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
            isBanned: false,
            bannedAt: null,
            banReason: null,
          },
        });
        console.log(`[admin] Promoted existing user ${email} to ADMIN`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          username,
          displayName,
          passwordHash,
          role: 'ADMIN',
          emailVerifiedAt: new Date(),
          balance: INITIAL_BALANCE,
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
          description: 'Admin account initial balance',
        },
      });

      await tx.userSettings.create({
        data: { userId: user.id },
      });
    });

    console.log(`[admin] Created bootstrap admin account: ${email}`);
  },
};

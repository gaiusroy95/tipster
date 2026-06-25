import { prisma } from '../../lib/prisma';
import { toUserDto } from '../../auth/user.mapper';
import { ApiException } from '../../lib/api-exception';
import { adminAuditService } from './admin-audit.service';

export const adminDashboardService = {
  async getStats() {
    const [userCount, activeBets, forumPosts, activeSeason, enabledLeagues, recentAudit] =
      await Promise.all([
        prisma.user.count(),
        prisma.bet.count({ where: { status: 'active' } }),
        prisma.forumPost.count({ where: { status: 'published' } }),
        prisma.season.findFirst({ where: { isActive: true }, include: { prizes: true } }),
        prisma.curatedLeague.count({ where: { isEnabled: true } }),
        adminAuditService.list({ page: 1, limit: 5 }),
      ]);

    return {
      userCount,
      activeBets,
      forumPosts,
      enabledLeagues,
      activeSeason: activeSeason
        ? {
            id: activeSeason.id,
            name: activeSeason.name,
            startDate: activeSeason.startDate.toISOString(),
            endDate: activeSeason.endDate.toISOString(),
          }
        : null,
      recentAudit: recentAudit.items,
    };
  },
};

export const adminUsersService = {
  async list(params: {
    search?: string;
    page?: number;
    limit?: number;
    banned?: boolean;
    role?: 'USER' | 'ADMIN';
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where = {
      ...(params.banned !== undefined ? { isBanned: params.banned } : {}),
      ...(params.role ? { role: params.role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { username: { contains: search, mode: 'insensitive' as const } },
              { displayName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users.map(toUserDto),
      total,
      page,
      limit,
    };
  },

  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return toUserDto(user);
  },

  async updateUser(
    adminUserId: string,
    userId: string,
    data: {
      role?: 'USER' | 'ADMIN';
      isBanned?: boolean;
      banReason?: string | null;
      displayName?: string;
      balanceAdjustment?: number;
      balanceReason?: string;
    },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return prisma.$transaction(async (tx) => {
      let newBalance = user.balance;

      if (data.balanceAdjustment && data.balanceAdjustment !== 0) {
        newBalance = user.balance + data.balanceAdjustment;
        if (newBalance < 0) {
          throw new ApiException('INVALID_BALANCE', 'Balance cannot be negative', 400);
        }

        await tx.walletTransaction.create({
          data: {
            userId,
            type: 'admin_adjustment',
            amount: data.balanceAdjustment,
            balanceAfter: newBalance,
            description: data.balanceReason || 'Admin balance adjustment',
          },
        });
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          ...(data.role !== undefined ? { role: data.role } : {}),
          ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
          ...(data.isBanned !== undefined
            ? {
                isBanned: data.isBanned,
                bannedAt: data.isBanned ? new Date() : null,
                banReason: data.isBanned ? data.banReason ?? 'Suspended by admin' : null,
              }
            : {}),
          ...(data.balanceAdjustment ? { balance: newBalance } : {}),
        },
      });

      await adminAuditService.log({
        adminUserId,
        action: 'user.update',
        entityType: 'user',
        entityId: userId,
        metadata: data as Record<string, unknown>,
      });

      return toUserDto(updated);
    });
  },

  async forceVerifyEmail(adminUserId: string, userId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });

    await adminAuditService.log({
      adminUserId,
      action: 'user.verify_email',
      entityType: 'user',
      entityId: userId,
    });

    return toUserDto(updated);
  },
};

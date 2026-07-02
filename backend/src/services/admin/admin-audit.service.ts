import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Map admin UI filter values to stored entityType values. */
export function normalizeAuditEntityFilter(entityType?: string) {
  const value = entityType?.trim();
  if (!value || value === 'all') return undefined;
  if (value === 'prize') return 'prize_tier';
  return value;
}

export const adminAuditService = {
  async log(params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.adminAuditLog.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  },

  async list(params: { page?: number; limit?: number; entityType?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const entityType = normalizeAuditEntityFilter(params.entityType);
    const where = entityType ? { entityType } : undefined;

    const [items, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: {
            select: { id: true, email: true, displayName: true, username: true },
          },
        },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        metadata: item.metadata,
        createdAt: item.createdAt.toISOString(),
        admin: item.admin,
      })),
      total,
      page,
      limit,
    };
  },
};

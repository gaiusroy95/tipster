import { prisma } from '../../lib/prisma';
import { adminAuditService } from './admin-audit.service';
import { sportsService } from '../sports.service';
import {
  arenaCategoryLabel,
  mapOvertimeMarketTypeToCategory,
} from '../../lib/map-overtime-market-category';

const DEFAULT_MARKET_TYPES = [
  {
    marketType: 'winner',
    label: '1X2 (Winner)',
    description: 'Home, draw, and away winner markets',
    sortOrder: 0,
    isEnabled: true,
  },
  {
    marketType: 'handicap',
    label: 'Handicap',
    description: 'Asian handicap lines',
    sortOrder: 1,
    isEnabled: true,
  },
  {
    marketType: 'over_under',
    label: 'Over/Under',
    description: 'Total goals over and under markets',
    sortOrder: 2,
    isEnabled: true,
  },
  {
    marketType: 'malay',
    label: 'Malay',
    description: 'Malay odds format markets',
    sortOrder: 3,
    isEnabled: false,
  },
] as const;

export const marketTypeConfigService = {
  async seedIfEmpty() {
    const count = await prisma.marketTypeConfig.count();
    if (count > 0) return;

    await prisma.marketTypeConfig.createMany({
      data: DEFAULT_MARKET_TYPES.map((row) => ({ ...row })),
    });
  },

  async listForAdmin() {
    await this.seedIfEmpty();
    return prisma.marketTypeConfig.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
  },

  async listOvertimeCatalog() {
    const types = await sportsService.fetchMarketTypesMapper();
    const byKey = new Map<
      string,
      {
        id: number;
        key: string;
        name: string;
        category: ReturnType<typeof mapOvertimeMarketTypeToCategory>;
        categoryLabel: string;
      }
    >();

    for (const type of Object.values(types)) {
      if (byKey.has(type.key)) continue;
      const category = mapOvertimeMarketTypeToCategory(type.key, type.id);
      byKey.set(type.key, {
        id: type.id,
        key: type.key,
        name: type.name,
        category,
        categoryLabel: arenaCategoryLabel(category),
      });
    }

    return [...byKey.values()].sort(
      (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
    );
  },

  async ensureDefaults(adminUserId?: string) {
    await this.seedIfEmpty();
    const rows = await this.listForAdmin();
    if (adminUserId) {
      await adminAuditService.log({
        adminUserId,
        action: 'market_types.ensure_defaults',
        entityType: 'market_type_config',
        metadata: { count: rows.length },
      });
    }
    return rows;
  },

  async listEnabledKeys() {
    await this.seedIfEmpty();
    const rows = await prisma.marketTypeConfig.findMany({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: { marketType: true },
    });
    return rows.map((row) => row.marketType);
  },

  async isEnabled(marketType: string) {
    await this.seedIfEmpty();
    const row = await prisma.marketTypeConfig.findUnique({
      where: { marketType },
      select: { isEnabled: true },
    });
    return row?.isEnabled ?? false;
  },

  /** Lightweight token that changes whenever admin market settings are mutated. */
  async getRevision() {
    const aggregate = await prisma.marketTypeConfig.aggregate({
      _max: { updatedAt: true },
      _count: { _all: true },
    });
    const enabledCount = await prisma.marketTypeConfig.count({ where: { isEnabled: true } });
    const updatedAt = aggregate._max.updatedAt?.getTime() ?? 0;
    return `${updatedAt}:${aggregate._count._all}:${enabledCount}`;
  },

  async update(
    adminUserId: string,
    id: string,
    data: { isEnabled?: boolean; sortOrder?: number; label?: string },
  ) {
    const updated = await prisma.marketTypeConfig.update({
      where: { id },
      data,
    });

    await adminAuditService.log({
      adminUserId,
      action: 'market_type.update',
      entityType: 'market_type_config',
      entityId: id,
      metadata: data as Record<string, unknown>,
    });

    return updated;
  },
};

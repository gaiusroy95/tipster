import { prisma } from '../../lib/prisma';
import { toSeasonDto } from '../../mappers/app.mapper';
import { leaderboardService } from '../leaderboard.service';
import { adminAuditService } from './admin-audit.service';

export const adminSeasonsService = {
  async list() {
    const seasons = await prisma.season.findMany({
      include: { prizes: true },
      orderBy: { startDate: 'desc' },
    });
    return seasons.map((s) => toSeasonDto(s, s.prizes));
  },

  async create(
    adminUserId: string,
    data: {
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      status?: string;
      prizes?: Array<{
        rankFrom: number;
        rankTo: number;
        name: string;
        description: string;
        imageUrl?: string;
      }>;
    },
  ) {
    const season = await prisma.season.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status ?? 'upcoming',
        isActive: false,
        prizes: data.prizes?.length
          ? { create: data.prizes }
          : undefined,
      },
      include: { prizes: true },
    });

    await adminAuditService.log({
      adminUserId,
      action: 'season.create',
      entityType: 'season',
      entityId: season.id,
    });

    return toSeasonDto(season, season.prizes);
  },

  async update(
    adminUserId: string,
    seasonId: string,
    data: {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ) {
    const season = await prisma.season.update({
      where: { id: seasonId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.startDate !== undefined ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate !== undefined ? { endDate: new Date(data.endDate) } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      include: { prizes: true },
    });

    await adminAuditService.log({
      adminUserId,
      action: 'season.update',
      entityType: 'season',
      entityId: seasonId,
      metadata: data as Record<string, unknown>,
    });

    return toSeasonDto(season, season.prizes);
  },

  async activate(adminUserId: string, seasonId: string) {
    await prisma.$transaction([
      prisma.season.updateMany({ data: { isActive: false, status: 'completed' } }),
      prisma.season.update({
        where: { id: seasonId },
        data: { isActive: true, status: 'active' },
      }),
    ]);

    await leaderboardService.syncAllUsersToActiveSeason();

    await adminAuditService.log({
      adminUserId,
      action: 'season.activate',
      entityType: 'season',
      entityId: seasonId,
    });

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { prizes: true },
    });
    return season ? toSeasonDto(season, season.prizes) : null;
  },

  async upsertPrize(
    adminUserId: string,
    seasonId: string,
    data: {
      id?: string;
      rankFrom: number;
      rankTo: number;
      name: string;
      description: string;
      imageUrl?: string;
    },
  ) {
    const prize = data.id
      ? await prisma.prizeTier.update({
          where: { id: data.id },
          data: {
            rankFrom: data.rankFrom,
            rankTo: data.rankTo,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
          },
        })
      : await prisma.prizeTier.create({
          data: {
            seasonId,
            rankFrom: data.rankFrom,
            rankTo: data.rankTo,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
          },
        });

    await adminAuditService.log({
      adminUserId,
      action: data.id ? 'prize.update' : 'prize.create',
      entityType: 'prize_tier',
      entityId: prize.id,
    });

    return prize;
  },

  async deletePrize(adminUserId: string, prizeId: string) {
    await prisma.prizeTier.delete({ where: { id: prizeId } });
    await adminAuditService.log({
      adminUserId,
      action: 'prize.delete',
      entityType: 'prize_tier',
      entityId: prizeId,
    });
  },
};

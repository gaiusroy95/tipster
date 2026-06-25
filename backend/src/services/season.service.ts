import { prisma } from '../lib/prisma';
import { toSeasonDto } from '../mappers/app.mapper';

const SEED_SEASONS = [
  {
    name: 'Season 2025/26',
    description:
      "Compete across Europe's top football leagues. Top 10 tipsters win physical prizes.",
    startDate: new Date('2025-08-01'),
    endDate: new Date('2026-08-31'),
    status: 'active',
    isActive: true,
    prizes: [
      {
        rankFrom: 1,
        rankTo: 1,
        name: 'Champion Trophy',
        description: "Premium trophy and winner's medal",
      },
      {
        rankFrom: 2,
        rankTo: 3,
        name: 'Elite Tipster Kit',
        description: 'Signed football jersey and merchandise bundle',
      },
      {
        rankFrom: 4,
        rankTo: 10,
        name: 'Rising Star Award',
        description: 'Sports accessories gift set',
      },
    ],
  },
  {
    name: 'Season 2024/25',
    description: 'Previous season archive.',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2025-05-31'),
    status: 'completed',
    isActive: false,
    prizes: [
      {
        rankFrom: 1,
        rankTo: 1,
        name: 'Champion Trophy',
        description: 'Premium trophy',
      },
    ],
  },
];

export const seasonService = {
  async removeDuplicateSeasons() {
    const seasons = await prisma.season.findMany({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { _count: { select: { participants: true } } },
    });

    const groups = new Map<string, typeof seasons>();
    for (const season of seasons) {
      const list = groups.get(season.name) ?? [];
      list.push(season);
      groups.set(season.name, list);
    }

    let removed = 0;
    for (const group of groups.values()) {
      if (group.length <= 1) continue;

      group.sort((a, b) => {
        if (b._count.participants !== a._count.participants) {
          return b._count.participants - a._count.participants;
        }
        return a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);
      });

      const [, ...dupes] = group;
      for (const dupe of dupes) {
        await prisma.season.delete({ where: { id: dupe.id } });
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[seed] Removed ${removed} duplicate season row(s)`);
    }
  },

  async ensureSingleActiveSeason() {
    const active = await prisma.season.findMany({
      where: { isActive: true },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'asc' }],
    });
    if (active.length <= 1) return;

    const [keep, ...rest] = active;
    await prisma.season.updateMany({
      where: { id: { in: rest.map((s) => s.id) } },
      data: { isActive: false, status: 'completed' },
    });
    console.log(`[seed] Deactivated ${rest.length} extra active season(s); kept "${keep.name}"`);
  },

  async seedIfEmpty() {
    await this.removeDuplicateSeasons();

    let created = 0;
    for (const seasonData of SEED_SEASONS) {
      const existing = await prisma.season.findFirst({ where: { name: seasonData.name } });
      if (existing) continue;

      await prisma.season.create({
        data: {
          name: seasonData.name,
          description: seasonData.description,
          startDate: seasonData.startDate,
          endDate: seasonData.endDate,
          status: seasonData.status,
          isActive: seasonData.isActive,
          prizes: {
            create: seasonData.prizes,
          },
        },
      });
      created++;
    }

    await this.ensureSingleActiveSeason();

    if (created > 0) {
      console.log(`[seed] Created ${created} season(s) with prize tiers`);
    }
  },

  async getActiveSeason() {
    return prisma.season.findFirst({
      where: { isActive: true },
      include: { prizes: true },
    });
  },

  async getActiveSeasonDto() {
    const season = await this.getActiveSeason();
    if (!season) return null;
    return toSeasonDto(season, season.prizes);
  },

  async listSeasons() {
    const seasons = await prisma.season.findMany({
      include: { prizes: true },
      orderBy: { startDate: 'desc' },
    });
    return seasons.map((s) => toSeasonDto(s, s.prizes));
  },

  async getSeasonById(seasonId: string) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { prizes: true },
    });
    if (!season) return null;
    return toSeasonDto(season, season.prizes);
  },
};

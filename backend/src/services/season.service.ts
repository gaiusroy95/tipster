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
  async seedIfEmpty() {
    const existing = await prisma.season.findFirst();
    if (existing) return;

    for (const seasonData of SEED_SEASONS) {
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
    }
    console.log('[seed] Seasons and prize tiers created');
  },

  async getActiveSeason() {
    return prisma.season.findFirst({
      where: { isActive: true },
      include: { prizes: true },
    });
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

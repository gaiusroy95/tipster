import { mapOvertimeCategoryToSportId } from '../../lib/map-overtime-sport';
import { sportsService } from '../sports.service';
import { prisma } from '../../lib/prisma';
import { adminAuditService } from './admin-audit.service';

const SEED_LEAGUE_NAMES = [
  { name: 'Premier League', country: 'England' },
  { name: 'La Liga', country: 'Spain' },
  { name: 'Serie A', country: 'Italy' },
  { name: 'Bundesliga', country: 'Germany' },
  { name: 'Ligue 1', country: 'France' },
];

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function matchSeedLeague(leagueName: string): (typeof SEED_LEAGUE_NAMES)[number] | undefined {
  const normalized = normalizeName(leagueName);
  return SEED_LEAGUE_NAMES.find(
    (seed) =>
      normalized.includes(normalizeName(seed.name)) ||
      normalizeName(seed.name).includes(normalized),
  );
}

export const curatedLeagueService = {
  async listCuratedPublic(sportId?: string) {
    return prisma.curatedLeague.findMany({
      where: {
        isEnabled: true,
        ...(sportId ? { sportId } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async listForAdmin(sportId?: string) {
    return prisma.curatedLeague.findMany({
      where: sportId ? { sportId } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async syncFromOvertime(adminUserId: string) {
    const grouped = await sportsService.fetchLeaguesMapper();
    const existing = await prisma.curatedLeague.findMany();
    const existingIds = new Set(existing.map((l) => l.overtimeLeagueId));
    let created = 0;

    const entries: Array<{
      overtimeLeagueId: number;
      name: string;
      country: string;
      sportId: string;
      sortOrder: number;
      isEnabled: boolean;
    }> = [];

    for (const [category, leagues] of Object.entries(grouped)) {
      const sportId = mapOvertimeCategoryToSportId(category);
      if (sportId !== 'soccer') continue;

      for (const league of leagues) {
        const seed = matchSeedLeague(league.name);
        entries.push({
          overtimeLeagueId: league.id,
          name: league.name,
          country: seed?.country ?? category,
          sportId,
          sortOrder: seed ? SEED_LEAGUE_NAMES.indexOf(seed) : 100 + entries.length,
          isEnabled: Boolean(seed),
        });
      }
    }

    for (const entry of entries) {
      if (existingIds.has(entry.overtimeLeagueId)) continue;
      await prisma.curatedLeague.create({ data: entry });
      created++;
      existingIds.add(entry.overtimeLeagueId);
    }

    if (existing.length === 0 && created === 0 && entries.length > 0) {
      for (const entry of entries.slice(0, 5)) {
        await prisma.curatedLeague.create({
          data: { ...entry, isEnabled: true, sortOrder: entries.indexOf(entry) },
        });
        created++;
      }
    }

    await adminAuditService.log({
      adminUserId,
      action: 'leagues.sync',
      entityType: 'curated_league',
      metadata: { created },
    });

    return this.listForAdmin('soccer');
  },

  async update(adminUserId: string, id: string, data: { isEnabled?: boolean; sortOrder?: number; name?: string; country?: string }) {
    const updated = await prisma.curatedLeague.update({
      where: { id },
      data,
    });

    await adminAuditService.log({
      adminUserId,
      action: 'league.update',
      entityType: 'curated_league',
      entityId: id,
      metadata: data as Record<string, unknown>,
    });

    return updated;
  },

  async reorder(adminUserId: string, orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.curatedLeague.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    await adminAuditService.log({
      adminUserId,
      action: 'leagues.reorder',
      entityType: 'curated_league',
      metadata: { orderedIds },
    });

    return this.listForAdmin();
  },
};

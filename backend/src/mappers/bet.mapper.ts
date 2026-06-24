import type { Bet } from '@prisma/client';

export interface BetDto {
  id: string;
  userId: string;
  matchId: string;
  marketType: string;
  selectionId: string;
  selectionLabel: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  status: string;
  betSize: string;
  placedAt: string;
  settledAt?: string;
  profitLoss?: number;
  homeTeam?: { id: string; name: string; shortName: string };
  awayTeam?: { id: string; name: string; shortName: string };
  league?: { id: string; name: string; country: string; sportId: string };
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map((p) => p[0]).join('').slice(0, 3).toUpperCase();
}

export function toBetDto(bet: Bet): BetDto {
  const dto: BetDto = {
    id: bet.id,
    userId: bet.userId,
    matchId: bet.matchId,
    marketType: bet.marketType,
    selectionId: bet.selectionId,
    selectionLabel: bet.selectionLabel,
    odds: bet.odds,
    stake: bet.stake,
    potentialReturn: bet.potentialReturn,
    status: bet.status,
    betSize: bet.betSize,
    placedAt: bet.placedAt.toISOString(),
    homeTeam: {
      id: bet.matchId,
      name: bet.homeTeamName,
      shortName: shortName(bet.homeTeamName),
    },
    awayTeam: {
      id: bet.matchId,
      name: bet.awayTeamName,
      shortName: shortName(bet.awayTeamName),
    },
  };

  if (bet.settledAt) dto.settledAt = bet.settledAt.toISOString();
  if (bet.profitLoss != null) dto.profitLoss = bet.profitLoss;

  if (bet.leagueName) {
    dto.league = {
      id: bet.leagueName,
      name: bet.leagueName,
      country: '',
      sportId: bet.sportId ?? 'soccer',
    };
  }

  return dto;
}

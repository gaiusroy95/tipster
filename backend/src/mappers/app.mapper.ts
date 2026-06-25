import type { Notification, Season, PrizeTier, SeasonParticipant, User } from '@prisma/client';

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PrizeTierDto {
  rankFrom: number;
  rankTo: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface SeasonDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
  description: string;
  prizes: PrizeTierDto[];
}

export interface LeaderboardEntryDto {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  points: number;
  roi: number;
  profitLoss: number;
  winRate: number;
  totalBets: number;
  form: string[];
}

export function toNotificationDto(n: Notification): NotificationDto {
  const dto: NotificationDto = {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
  if (n.link) dto.link = n.link;
  return dto;
}

export function toPrizeTierDto(tier: PrizeTier): PrizeTierDto {
  const dto: PrizeTierDto = {
    rankFrom: tier.rankFrom,
    rankTo: tier.rankTo,
    name: tier.name,
    description: tier.description,
  };
  if (tier.imageUrl) dto.imageUrl = tier.imageUrl;
  return dto;
}

export function toSeasonDto(
  season: Season,
  prizes: PrizeTier[],
): SeasonDto {
  return {
    id: season.id,
    name: season.name,
    startDate: season.startDate.toISOString().slice(0, 10),
    endDate: season.endDate.toISOString().slice(0, 10),
    status: season.status,
    isActive: season.isActive,
    description: season.description,
    prizes: prizes.map(toPrizeTierDto),
  };
}

export function toLeaderboardEntryDto(
  participant: SeasonParticipant,
  user: Pick<User, 'displayName' | 'username' | 'avatarUrl'>,
): LeaderboardEntryDto {
  const dto: LeaderboardEntryDto = {
    userId: participant.userId,
    displayName: user.displayName,
    username: user.username,
    rank: participant.rank,
    points: participant.points,
    roi: participant.roi,
    profitLoss: participant.profitLoss,
    winRate: participant.winRate,
    totalBets: participant.totalBets,
    form: participant.form.slice(0, 5),
  };
  if (user.avatarUrl) dto.avatarUrl = user.avatarUrl;
  return dto;
}

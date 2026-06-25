import type { User } from '@prisma/client';

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  country?: string;
  signature?: string;
  signatureLink?: string;
  signatureMode?: string;
  postCount?: number;
  balance: number;
  rank: number;
  role: User['role'];
  isBanned: boolean;
  createdAt: string;
  authProviders: string[];
  primaryAuthProvider: string;
}

export function toUserDto(user: User): UserDto {
  const dto: UserDto = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    balance: user.balance,
    rank: user.rank,
    role: user.role,
    isBanned: user.isBanned,
    createdAt: user.createdAt.toISOString(),
    authProviders: user.authProviders,
    primaryAuthProvider: user.primaryAuthProvider,
    postCount: user.postCount,
  };

  if (user.avatarUrl) dto.avatarUrl = user.avatarUrl;
  if (user.country) dto.country = user.country;
  if (user.signature) dto.signature = user.signature;
  if (user.signatureLink) dto.signatureLink = user.signatureLink;
  if (user.signatureMode) dto.signatureMode = user.signatureMode;

  return dto;
}

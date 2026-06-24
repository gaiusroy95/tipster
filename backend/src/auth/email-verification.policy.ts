import type { User } from '@prisma/client';

/** User must verify email when unverified or signing in from a new IP. */
export function needsEmailVerification(user: User, clientIp: string): boolean {
  if (!user.emailVerifiedAt) return true;
  if (!user.verifiedIp) {
    return Boolean(user.registrationIp && user.registrationIp !== clientIp);
  }
  return user.verifiedIp !== clientIp;
}

export function isIpReverification(user: User, clientIp: string): boolean {
  return Boolean(user.emailVerifiedAt && needsEmailVerification(user, clientIp));
}

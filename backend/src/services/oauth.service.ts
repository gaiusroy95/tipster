import type { User } from '@prisma/client';
import { prisma, withDbRetry } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import {
  AUTH_PROVIDER_FACEBOOK,
  AUTH_PROVIDER_GOOGLE,
  INITIAL_BALANCE,
  type OAuthProvider,
  SUPPORTED_OAUTH_PROVIDERS,
} from '../auth/auth.constants';
import { toUserDto, type UserDto } from '../auth/user.mapper';
import { signToken } from '../middleware/auth.middleware';
import { googleOAuthService } from './google-oauth.service';
import { facebookOAuthService } from './facebook-oauth.service';
import type { SocialOAuthProfile } from './social-oauth.types';
import { oauthStateService, type OAuthMode } from './oauth-state.service';
import { normalizeGooglePictureUrl } from '../lib/google-avatar';
import { leaderboardService } from './leaderboard.service';

function applySocialAvatarIfEmpty(
  updateData: { authProviders: string[]; avatarUrl?: string; emailVerifiedAt?: Date },
  provider: string,
  picture: string | undefined,
  currentAvatarUrl: string | null | undefined,
): void {
  if (!picture || currentAvatarUrl?.trim()) return;
  if (provider === AUTH_PROVIDER_GOOGLE) {
    updateData.avatarUrl = normalizeGooglePictureUrl(picture) ?? picture;
    return;
  }
  if (provider === AUTH_PROVIDER_FACEBOOK) {
    updateData.avatarUrl = picture;
  }
}

function isSocialEmailVerified(provider: string): boolean {
  return provider === AUTH_PROVIDER_GOOGLE || provider === AUTH_PROVIDER_FACEBOOK;
}

const ALL_SOCIAL_PROVIDERS = ['google', 'facebook', 'apple'] as const;

function isOAuthProvider(value: string): value is OAuthProvider {
  return SUPPORTED_OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

function sanitizeUsername(value: string): string {
  const base = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  return base || 'player';
}

async function uniqueUsername(base: string): Promise<string> {
  const candidate = sanitizeUsername(base);
  const existing = await withDbRetry(() =>
    prisma.user.findUnique({ where: { username: candidate }, select: { id: true } }),
  );
  if (!existing) return candidate;
  return `${candidate}${Date.now().toString(36).slice(-4)}`;
}

function mergeAuthProviders(existing: string[], provider: string): string[] {
  return Array.from(new Set([...existing, provider]));
}

function removeAuthProvider(existing: string[], provider: string): string[] {
  return existing.filter((p) => p !== provider);
}

function normalizeRedirectUri(uri: string): string {
  try {
    const parsed = new URL(uri.trim());
    const pathname = parsed.pathname.replace(/\/$/, '') || '';
    return `${parsed.origin}${pathname}`;
  } catch {
    return uri.trim().replace(/\/$/, '');
  }
}

const profileByState = new Map<string, { profile: SocialOAuthProfile; expiresAt: number }>();

function cacheOAuthProfile(state: string, profile: SocialOAuthProfile): void {
  profileByState.set(state, {
    profile,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}

function getCachedOAuthProfile(state: string): SocialOAuthProfile | null {
  const cached = profileByState.get(state);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    profileByState.delete(state);
    return null;
  }
  return cached.profile;
}

function clearOAuthProfileCache(state: string): void {
  profileByState.delete(state);
}

async function resolveOAuthProfile(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  state: string,
): Promise<SocialOAuthProfile> {
  const cached = getCachedOAuthProfile(state);
  if (cached) return cached;

  const profile =
    provider === 'google'
      ? await googleOAuthService.exchangeCode(code, redirectUri)
      : await facebookOAuthService.exchangeCode(code, redirectUri);

  cacheOAuthProfile(state, profile);
  return profile;
}

export const oauthService = {
  isSupportedProvider(value: string): value is OAuthProvider {
    return isOAuthProvider(value);
  },

  async getAuthorizationUrl(
    provider: OAuthProvider,
    mode: OAuthMode,
    redirectUri: string,
    userId?: string,
  ): Promise<string> {
    const normalizedRedirectUri = normalizeRedirectUri(redirectUri);
    const state = await oauthStateService.create(
      provider,
      mode,
      normalizedRedirectUri,
      userId,
    );
    if (provider === 'google') {
      return googleOAuthService.buildAuthorizationUrl(state, normalizedRedirectUri);
    }
    if (provider === 'facebook') {
      return facebookOAuthService.buildAuthorizationUrl(state, normalizedRedirectUri);
    }
    throw new ApiException('INVALID_PROVIDER', 'Unsupported social provider', 400);
  },

  /** Resolve provider from stored OAuth state — callback does not need sessionStorage. */
  async completeOAuthFromState(
    code: string,
    state: string,
    redirectUri: string,
    clientIp: string,
    signupCountry: string | null,
  ): Promise<{ user: UserDto; token: string; isNewUser: boolean }> {
    const oauthState = await oauthStateService.validate(state);
    if (!oauthState) {
      throw new ApiException('INVALID_OAUTH', 'OAuth state expired or invalid', 400);
    }
    return this.completeOAuth(
      oauthState.provider,
      code,
      state,
      redirectUri,
      clientIp,
      signupCountry,
    );
  },

  async linkAccountFromState(
    userId: string,
    code: string,
    state: string,
    redirectUri: string,
  ): Promise<{ user: UserDto }> {
    const oauthState = await oauthStateService.validate(state);
    if (!oauthState) {
      throw new ApiException('INVALID_OAUTH', 'OAuth state expired or invalid', 400);
    }
    return this.linkAccount(userId, oauthState.provider, code, state, redirectUri);
  },

  async completeOAuth(
    provider: OAuthProvider,
    code: string,
    state: string,
    redirectUri: string,
    clientIp: string,
    signupCountry: string | null,
  ): Promise<{ user: UserDto; token: string; isNewUser: boolean }> {
    const oauthState = await oauthStateService.validate(state);
    if (!oauthState || oauthState.provider !== provider) {
      throw new ApiException('INVALID_OAUTH', 'OAuth state expired or invalid', 400);
    }
    if (oauthState.mode === 'link') {
      throw new ApiException('INVALID_OAUTH', 'Use link endpoint for account linking', 400);
    }
    if (oauthState.redirectUri !== normalizeRedirectUri(redirectUri)) {
      throw new ApiException('INVALID_OAUTH', 'redirectUri mismatch', 400);
    }

    const profile = await resolveOAuthProfile(provider, code, oauthState.redirectUri, state);

    const result = await this.signInWithSocialProfile(provider, profile, clientIp, signupCountry);

    await oauthStateService.delete(state);
    clearOAuthProfileCache(state);
    return result;
  },

  async completeGoogleWithCredential(
    credential: string,
    clientIp: string,
    signupCountry: string | null,
  ): Promise<{ user: UserDto; token: string; isNewUser: boolean }> {
    const profile = await googleOAuthService.verifyIdTokenCredential(credential);
    return this.signInWithSocialProfile(AUTH_PROVIDER_GOOGLE, profile, clientIp, signupCountry);
  },

  async signInWithSocialProfile(
    provider: OAuthProvider,
    profile: SocialOAuthProfile,
    clientIp: string,
    signupCountry: string | null,
  ): Promise<{ user: UserDto; token: string; isNewUser: boolean }> {
    return withDbRetry(async () => {
      const linkedAccount = await prisma.socialAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: profile.sub,
          },
        },
        include: { user: true },
      });

      if (linkedAccount) {
        const user = await this.touchSocialAccount(
          linkedAccount.user,
          provider,
          profile.email,
          profile.picture,
        );
        return {
          user: toUserDto(user),
          token: signToken(user),
          isNewUser: false,
        };
      }

      const emailUser = await prisma.user.findUnique({ where: { email: profile.email } });
      if (emailUser) {
        const user = await this.linkSocialToUser(
          emailUser,
          provider,
          profile.sub,
          profile.email,
          profile.picture,
        );
        return {
          user: toUserDto(user),
          token: signToken(user),
          isNewUser: false,
        };
      }

      const user = await this.createSocialUser(
        provider,
        {
          sub: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        },
        clientIp,
        signupCountry,
      );
      return {
        user: toUserDto(user),
        token: signToken(user),
        isNewUser: true,
      };
    });
  },

  async linkAccount(
    userId: string,
    provider: OAuthProvider,
    code: string,
    state: string,
    redirectUri: string,
  ): Promise<{ user: UserDto }> {
    const oauthState = await oauthStateService.validate(state);
    if (!oauthState || oauthState.mode !== 'link' || oauthState.userId !== userId) {
      throw new ApiException('INVALID_OAUTH', 'OAuth state expired or invalid', 400);
    }
    if (oauthState.redirectUri !== normalizeRedirectUri(redirectUri)) {
      throw new ApiException('INVALID_OAUTH', 'redirectUri mismatch', 400);
    }

    const profile = await resolveOAuthProfile(provider, code, oauthState.redirectUri, state);

    const result = await withDbRetry(async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new ApiException('NOT_FOUND', 'User not found', 404);
      }

      const existingLink = await prisma.socialAccount.findFirst({
        where: { userId, provider },
      });
      if (existingLink) {
        throw new ApiException('ALREADY_LINKED', 'This provider is already connected', 409);
      }

      const otherLink = await prisma.socialAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId: profile.sub,
          },
        },
      });
      if (otherLink && otherLink.userId !== userId) {
        throw new ApiException('EMAIL_IN_USE', 'This social account is linked to another user', 409);
      }

      const emailOwner = await prisma.user.findUnique({ where: { email: profile.email } });
      if (emailOwner && emailOwner.id !== userId) {
        throw new ApiException('EMAIL_IN_USE', 'This social account is linked to another user', 409);
      }

      const updated = await this.linkSocialToUser(
        user,
        provider,
        profile.sub,
        profile.email,
        profile.picture,
      );
      return { user: toUserDto(updated) };
    });

    await oauthStateService.delete(state);
    clearOAuthProfileCache(state);
    return result;
  },

  async unlinkAccount(userId: string, provider: OAuthProvider): Promise<{ user: UserDto }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiException('NOT_FOUND', 'User not found', 404);
    }

    const link = await prisma.socialAccount.findFirst({
      where: { userId, provider },
    });
    if (!link) {
      throw new ApiException('NOT_LINKED', 'Provider is not connected', 400);
    }

    const remainingProviders = removeAuthProvider(user.authProviders, provider);
    const hasEmail = remainingProviders.includes('email');
    const hasOtherSocial = remainingProviders.some((p) => p !== 'email');

    if (!hasEmail && !hasOtherSocial) {
      throw new ApiException(
        'LAST_AUTH_METHOD',
        'Connect email or another social account before disconnecting',
        400,
      );
    }

    await prisma.$transaction([
      prisma.socialAccount.delete({ where: { id: link.id } }),
      prisma.user.update({
        where: { id: userId },
        data: { authProviders: remainingProviders },
      }),
    ]);

    const updated = await prisma.user.findUnique({ where: { id: userId } });
    if (!updated) {
      throw new ApiException('NOT_FOUND', 'User not found', 404);
    }
    return { user: toUserDto(updated) };
  },

  async getLinkedAccounts(userId: string) {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId },
      orderBy: { linkedAt: 'asc' },
    });

    const linked = new Set(accounts.map((a) => a.provider));
    const availableProviders = ALL_SOCIAL_PROVIDERS.filter((p) => !linked.has(p));

    return {
      accounts: accounts.map((a) => ({
        provider: a.provider,
        email: a.email,
        linkedAt: a.linkedAt.toISOString(),
      })),
      availableProviders: [...availableProviders],
    };
  },

  async createSocialUser(
    provider: OAuthProvider,
    profile: {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    },
    clientIp: string,
    signupCountry: string | null,
  ): Promise<User> {
    const username = await uniqueUsername(profile.name);
    const avatarUrl =
      provider === AUTH_PROVIDER_GOOGLE
        ? normalizeGooglePictureUrl(profile.picture) ?? null
        : profile.picture ?? null;

    const user = await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: profile.email,
            username,
            displayName: profile.name,
            avatarUrl,
            passwordHash: null,
            emailVerifiedAt: new Date(),
            registrationIp: clientIp,
            country: signupCountry,
            balance: INITIAL_BALANCE,
            rank: 0,
            authProviders: [provider],
            primaryAuthProvider: provider,
          },
        });

        await tx.socialAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId: profile.sub,
            email: profile.email,
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: user.id,
            type: 'initial',
            amount: INITIAL_BALANCE,
            balanceAfter: INITIAL_BALANCE,
            description: 'Welcome bonus — initial virtual credits',
          },
        });

        await tx.userSettings.create({
          data: { userId: user.id },
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'system',
            title: 'Welcome to Tipster Arena',
            message:
              'You received 1,000,000 virtual credits. Start placing bets on upcoming fixtures!',
            link: '/fixtures',
          },
        });

        return user;
      }),
    );

    await leaderboardService.enrollUserInActiveSeason(user.id);
    const refreshed = await prisma.user.findUnique({ where: { id: user.id } });
    return refreshed ?? user;
  },

  async linkSocialToUser(
    user: User,
    provider: string,
    providerAccountId: string,
    email: string,
    picture?: string,
  ): Promise<User> {
    const existing = await prisma.socialAccount.findFirst({
      where: { userId: user.id, provider },
    });

    if (existing) {
      const updateData: {
        authProviders: string[];
        avatarUrl?: string;
        emailVerifiedAt?: Date;
      } = {
        authProviders: mergeAuthProviders(user.authProviders, provider),
      };
      applySocialAvatarIfEmpty(updateData, provider, picture, user.avatarUrl);
      if (!user.emailVerifiedAt && isSocialEmailVerified(provider)) {
        updateData.emailVerifiedAt = new Date();
      }
      return prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    await prisma.socialAccount.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
        email,
      },
    });

    const updateData: { authProviders: string[]; avatarUrl?: string; emailVerifiedAt?: Date } = {
      authProviders: mergeAuthProviders(user.authProviders, provider),
    };
    applySocialAvatarIfEmpty(updateData, provider, picture, user.avatarUrl);
    if (!user.emailVerifiedAt && isSocialEmailVerified(provider)) {
      updateData.emailVerifiedAt = new Date();
    }

    return prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  },

  async touchSocialAccount(
    user: User,
    provider: string,
    email: string,
    _picture?: string,
  ): Promise<User> {
    const updateData: { authProviders: string[]; emailVerifiedAt?: Date } = {
      authProviders: mergeAuthProviders(user.authProviders, provider),
    };
    if (!user.emailVerifiedAt && isSocialEmailVerified(provider)) {
      updateData.emailVerifiedAt = new Date();
    }

    return prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  },
};

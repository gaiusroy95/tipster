import { ApiException } from '../lib/api-exception';
import { getOAuthJson, isOAuthNetworkError } from '../lib/oauth-http';

export interface FacebookProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

const GRAPH_VERSION = 'v19.0';

function getFacebookAppId(): string {
  const id = process.env.FACEBOOK_APP_ID?.trim();
  if (!id) {
    throw new ApiException('OAUTH_NOT_CONFIGURED', 'Facebook sign-in is not configured', 503);
  }
  return id;
}

function getFacebookAppSecret(): string {
  const secret = process.env.FACEBOOK_APP_SECRET?.trim();
  if (!secret) {
    throw new ApiException('OAUTH_NOT_CONFIGURED', 'Facebook sign-in is not configured', 503);
  }
  return secret;
}

function mapFacebookExchangeError(
  error: { error?: { message?: string; type?: string; code?: number }; access_token?: string } | undefined,
  redirectUri: string,
): never {
  console.error('[FacebookOAuth] token exchange failed:', error?.error);

  const message = error?.error?.message ?? 'Failed to exchange Facebook authorization code';
  if (message.toLowerCase().includes('redirect_uri')) {
    throw new ApiException(
      'INVALID_OAUTH',
      'Facebook redirect URI mismatch. In Meta Developer Console, add this exact URI under Valid OAuth Redirect URIs: ' +
        redirectUri,
      400,
    );
  }

  throw new ApiException('INVALID_OAUTH', message, 400);
}

function mapFacebookNetworkError(error: unknown): never {
  console.error('[FacebookOAuth] network error:', error instanceof Error ? error.message : error);
  throw new ApiException(
    'OAUTH_NETWORK_ERROR',
    'Could not reach Facebook sign-in services. Check your internet connection, then try again.',
    503,
  );
}

function normalizeFacebookPictureUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.startsWith('http')) return value;
  if (value && typeof value === 'object' && 'data' in value) {
    const data = (value as { data?: { url?: string } }).data;
    if (data?.url?.startsWith('http')) return data.url;
  }
  return undefined;
}

export const facebookOAuthService = {
  buildAuthorizationUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: getFacebookAppId(),
      redirect_uri: redirectUri,
      state,
      scope: 'email,public_profile',
      response_type: 'code',
    });
    return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<FacebookProfile> {
    try {
      const tokenRes = await getOAuthJson<{
        access_token?: string;
        error?: { message?: string; type?: string; code?: number };
      }>(
        `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${new URLSearchParams({
          client_id: getFacebookAppId(),
          client_secret: getFacebookAppSecret(),
          redirect_uri: redirectUri,
          code,
        }).toString()}`,
        {},
        { timeoutMs: 12_000, retries: 1 },
      );

      if (tokenRes.status !== 200 || !tokenRes.data.access_token) {
        mapFacebookExchangeError(tokenRes.data, redirectUri);
      }

      const accessToken = tokenRes.data.access_token;

      const profileRes = await getOAuthJson<{
        id?: string;
        name?: string;
        email?: string;
        picture?: unknown;
        error?: { message?: string };
      }>(
        `https://graph.facebook.com/${GRAPH_VERSION}/me?${new URLSearchParams({
          fields: 'id,name,email,picture.type(large)',
          access_token: accessToken,
        }).toString()}`,
        {},
        { timeoutMs: 12_000, retries: 1 },
      );

      if (profileRes.status !== 200 || profileRes.data.error) {
        throw new ApiException(
          'INVALID_OAUTH',
          profileRes.data.error?.message ?? 'Failed to load Facebook profile',
          400,
        );
      }

      const data = profileRes.data;
      if (!data.id) {
        throw new ApiException('INVALID_OAUTH', 'Facebook profile missing required fields', 400);
      }

      if (!data.email) {
        throw new ApiException(
          'INVALID_OAUTH',
          'Facebook did not share your email. Grant email permission or use another sign-in method.',
          400,
        );
      }

      return {
        sub: data.id,
        email: data.email.toLowerCase(),
        emailVerified: true,
        name: data.name?.trim() || data.email.split('@')[0],
        picture: normalizeFacebookPictureUrl(data.picture),
      };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      if (isOAuthNetworkError(error)) {
        mapFacebookNetworkError(error);
      }
      console.error('[FacebookOAuth] unexpected exchange error:', error);
      throw new ApiException('INVALID_OAUTH', 'Invalid or expired Facebook authorization code', 400);
    }
  },
};

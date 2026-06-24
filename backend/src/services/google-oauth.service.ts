import axios from 'axios';
import { createLocalJWKSet, jwtVerify } from 'jose';
import { ApiException } from '../lib/api-exception';
import { normalizeGooglePictureUrl } from '../lib/google-avatar';
import { getOAuthJson, isOAuthNetworkError, postOAuthForm } from '../lib/oauth-http';

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

function getGoogleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!id) {
    throw new ApiException('OAUTH_NOT_CONFIGURED', 'Google sign-in is not configured', 503);
  }
  return id;
}

function getGoogleClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new ApiException('OAUTH_NOT_CONFIGURED', 'Google sign-in is not configured', 503);
  }
  return secret;
}

function mapGoogleExchangeError(
  googleError: { error?: string; error_description?: string } | undefined,
  redirectUri: string,
): never {
  console.error('[GoogleOAuth] token exchange failed:', {
    error: googleError?.error,
    error_description: googleError?.error_description,
  });

  if (googleError?.error === 'redirect_uri_mismatch') {
    throw new ApiException(
      'INVALID_OAUTH',
      'Google redirect URI mismatch. In Google Cloud Console, add this exact URI under Authorized redirect URIs: ' +
        redirectUri,
      400,
    );
  }

  if (googleError?.error === 'invalid_grant') {
    throw new ApiException(
      'INVALID_OAUTH',
      'Google sign-in session expired. Close this tab, return to Sign in, and try again.',
      400,
    );
  }

  throw new ApiException(
    'INVALID_OAUTH',
    googleError?.error_description ?? 'Failed to exchange Google authorization code',
    400,
  );
}

function mapGoogleNetworkError(error: unknown): never {
  console.error('[GoogleOAuth] network error during exchange:', {
    code: axios.isAxiosError(error) ? error.code : undefined,
    message: error instanceof Error ? error.message : String(error),
  });
  throw new ApiException(
    'OAUTH_NETWORK_ERROR',
    'Could not reach Google sign-in services. Check your internet connection or VPN, then try again from the Sign in page.',
    503,
  );
}

const JWKS_MAX_AGE_MS = 6 * 60 * 60 * 1000;
let cachedJwks: { keys: JsonWebKey[]; fetchedAt: number } | null = null;

async function getGoogleJwks(): Promise<JsonWebKey[]> {
  const maxAge = JWKS_MAX_AGE_MS;
  if (cachedJwks && Date.now() - cachedJwks.fetchedAt < maxAge) {
    return cachedJwks.keys;
  }

  try {
    const res = await getOAuthJson<{ keys?: JsonWebKey[] }>(
      'https://www.googleapis.com/oauth2/v3/certs',
      {},
      { timeoutMs: 30_000, retries: 2 },
    );
    if (res.status === 200 && res.data?.keys?.length) {
      cachedJwks = { keys: res.data.keys, fetchedAt: Date.now() };
      return cachedJwks.keys;
    }
  } catch (error) {
    if (cachedJwks) return cachedJwks.keys;
    if (isOAuthNetworkError(error)) mapGoogleNetworkError(error);
    throw error;
  }

  if (cachedJwks) return cachedJwks.keys;
  throw new ApiException('OAUTH_NETWORK_ERROR', 'Could not load Google sign-in keys', 503);
}

function profileFromIdToken(idToken: string): GoogleProfile {
  const segments = idToken.split('.');
  if (segments.length !== 3) {
    throw new ApiException('INVALID_OAUTH', 'Invalid Google sign-in token', 400);
  }

  const payload = JSON.parse(
    Buffer.from(segments[1], 'base64url').toString('utf8'),
  ) as Record<string, unknown>;

  const clientId = getGoogleClientId();
  const aud = payload.aud;
  const audienceOk =
    aud === clientId || (Array.isArray(aud) && aud.includes(clientId));
  if (!audienceOk) {
    throw new ApiException('INVALID_OAUTH', 'Invalid Google token audience', 400);
  }

  return profileFromJwtPayload(payload);
}

function tokenResponseProfile(data: unknown): GoogleProfile | null {
  const idToken = (data as { id_token?: string })?.id_token;
  if (!idToken) return null;
  try {
    return profileFromIdToken(idToken);
  } catch {
    return null;
  }
}
function profileFromJwtPayload(payload: Record<string, unknown>): GoogleProfile {
  const sub = payload.sub as string | undefined;
  const email = payload.email as string | undefined;
  if (!sub || !email) {
    throw new ApiException('INVALID_OAUTH', 'Google profile missing required fields', 400);
  }

  const name =
    (payload.name as string | undefined)?.trim() ||
    (payload.given_name as string | undefined)?.trim() ||
    email.split('@')[0];

  return {
    sub,
    email: email.toLowerCase(),
    emailVerified: payload.email_verified === true,
    name,
    picture: normalizeGooglePictureUrl(payload.picture as string | undefined),
  };
}

export const googleOAuthService = {
  buildAuthorizationUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: getGoogleClientId(),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  async exchangeCode(code: string, redirectUri: string): Promise<GoogleProfile> {
    try {
      const tokenRes = await postOAuthForm(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: getGoogleClientId(),
          client_secret: getGoogleClientSecret(),
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
        { timeoutMs: 12_000, retries: 1 },
      );

      if (tokenRes.status !== 200) {
        mapGoogleExchangeError(
          tokenRes.data as { error?: string; error_description?: string },
          redirectUri,
        );
      }

      const profileFromToken = tokenResponseProfile(tokenRes.data);
      if (profileFromToken) return profileFromToken;

      const accessToken = (tokenRes.data as { access_token?: string })?.access_token;
      if (!accessToken) {
        throw new ApiException('INVALID_OAUTH', 'Failed to exchange Google authorization code', 400);
      }

      const profileRes = await getOAuthJson<{
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      }>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { Authorization: `Bearer ${accessToken}` },
        { timeoutMs: 12_000, retries: 1 },
      );

      if (profileRes.status !== 200) {
        throw new ApiException('INVALID_OAUTH', 'Failed to load Google profile', 400);
      }

      const data = profileRes.data;
      if (!data.sub || !data.email) {
        throw new ApiException('INVALID_OAUTH', 'Google profile missing required fields', 400);
      }

      return {
        sub: data.sub,
        email: data.email.toLowerCase(),
        emailVerified: Boolean(data.email_verified),
        name: data.name?.trim() || data.email.split('@')[0],
        picture: normalizeGooglePictureUrl(data.picture),
      };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      if (isOAuthNetworkError(error)) {
        mapGoogleNetworkError(error);
      }
      console.error('[GoogleOAuth] unexpected exchange error:', error);
      throw new ApiException('INVALID_OAUTH', 'Invalid or expired Google authorization code', 400);
    }
  },

  async verifyIdTokenCredential(credential: string): Promise<GoogleProfile> {
    try {
      const jwks = createLocalJWKSet({ keys: await getGoogleJwks() });
      const { payload } = await jwtVerify(credential, jwks, {
        audience: getGoogleClientId(),
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
      });
      return profileFromJwtPayload(payload as Record<string, unknown>);
    } catch (error) {
      if (error instanceof ApiException) throw error;
      console.error('[GoogleOAuth] id token verification failed:', error);
      throw new ApiException('INVALID_OAUTH', 'Invalid Google sign-in token', 400);
    }
  },
};

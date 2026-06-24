import axios from 'axios';
import { ApiException } from '../lib/api-exception';
import { normalizeGooglePictureUrl } from '../lib/google-avatar';

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
      const tokenRes = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: getGoogleClientId(),
          client_secret: getGoogleClientSecret(),
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 15000,
          validateStatus: (status) => status < 500,
        },
      );

      if (tokenRes.status !== 200) {
        const googleError = tokenRes.data as {
          error?: string;
          error_description?: string;
        };
        console.error('[GoogleOAuth] token exchange failed:', googleError);

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

      const accessToken = tokenRes.data?.access_token as string | undefined;
      if (!accessToken) {
        throw new ApiException('INVALID_OAUTH', 'Failed to exchange Google authorization code', 400);
      }

      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });

      const data = profileRes.data as {
        sub?: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };

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
      console.error('[GoogleOAuth] unexpected exchange error:', error);
      throw new ApiException('INVALID_OAUTH', 'Invalid or expired Google authorization code', 400);
    }
  },
};

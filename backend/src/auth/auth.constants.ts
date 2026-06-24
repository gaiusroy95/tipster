export const INITIAL_BALANCE = 1000000;

export const AUTH_PROVIDER_EMAIL = 'email';
export const AUTH_PROVIDER_GOOGLE = 'google';
export const AUTH_PROVIDER_FACEBOOK = 'facebook';

export const SUPPORTED_OAUTH_PROVIDERS = ['google', 'facebook'] as const;
export type OAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

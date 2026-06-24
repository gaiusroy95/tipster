import { z } from 'zod';

export const oauthExchangeSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
  redirectUri: z.string().url(),
});

export const googleCredentialSchema = z.object({
  credential: z.string().min(1),
});

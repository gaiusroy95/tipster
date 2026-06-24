import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { oauthExchangeSchema, googleCredentialSchema } from '../schemas/oauth.schemas';
import { oauthService } from '../services/oauth.service';
import { ApiException } from '../lib/api-exception';

export const oauthRouter = Router();

function parseOAuthMode(value: string | undefined): 'login' | 'register' | 'link' {
  if (value === 'login' || value === 'register' || value === 'link') return value;
  throw new ApiException('INVALID_REQUEST', 'Invalid OAuth mode', 400);
}

oauthRouter.get(
  '/:provider/url',
  (req, res, next) => {
    if (req.query.mode === 'link') {
      return requireAuth(req, res, next);
    }
    next();
  },
  asyncHandler(async (req, res) => {
    const provider = String(req.params.provider);
    if (!oauthService.isSupportedProvider(provider)) {
      throw new ApiException('INVALID_PROVIDER', 'Unsupported social provider', 400);
    }

    const redirectUri = req.query.redirectUri as string | undefined;
    if (!redirectUri) {
      throw new ApiException('INVALID_REQUEST', 'redirectUri is required', 400);
    }

    const mode = parseOAuthMode((req.query.mode as string | undefined) ?? 'login');

    const userId =
      mode === 'link' ? (req as AuthenticatedRequest).user.id : undefined;

    const url = await oauthService.getAuthorizationUrl(provider, mode, redirectUri, userId);
    res.json({ data: { url } });
  }),
);

oauthRouter.post(
  '/google/credential',
  validateBody(googleCredentialSchema),
  asyncHandler(async (req, res) => {
    const result = await oauthService.completeGoogleWithCredential(req.body.credential);
    res.json({ data: result });
  }),
);

oauthRouter.post(
  '/complete',
  validateBody(oauthExchangeSchema),
  asyncHandler(async (req, res) => {
    const result = await oauthService.completeOAuthFromState(
      req.body.code,
      req.body.state,
      req.body.redirectUri,
    );
    res.json({ data: result });
  }),
);

oauthRouter.post(
  '/complete/link',
  requireAuth,
  validateBody(oauthExchangeSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await oauthService.linkAccountFromState(
      user.id,
      req.body.code,
      req.body.state,
      req.body.redirectUri,
    );
    res.json({ data: result });
  }),
);

oauthRouter.post(
  '/:provider',
  validateBody(oauthExchangeSchema),
  asyncHandler(async (req, res) => {
    const provider = String(req.params.provider);
    if (!oauthService.isSupportedProvider(provider)) {
      throw new ApiException('INVALID_PROVIDER', 'Unsupported social provider', 400);
    }

    const result = await oauthService.completeOAuth(
      provider,
      req.body.code,
      req.body.state,
      req.body.redirectUri,
    );
    res.json({ data: result });
  }),
);

oauthRouter.post(
  '/:provider/link',
  requireAuth,
  validateBody(oauthExchangeSchema),
  asyncHandler(async (req, res) => {
    const provider = String(req.params.provider);
    if (!oauthService.isSupportedProvider(provider)) {
      throw new ApiException('INVALID_PROVIDER', 'Unsupported social provider', 400);
    }

    const { user } = req as AuthenticatedRequest;
    const result = await oauthService.linkAccount(
      user.id,
      provider,
      req.body.code,
      req.body.state,
      req.body.redirectUri,
    );
    res.json({ data: result });
  }),
);

oauthRouter.delete(
  '/:provider/unlink',
  requireAuth,
  asyncHandler(async (req, res) => {
    const provider = String(req.params.provider);
    if (!oauthService.isSupportedProvider(provider)) {
      throw new ApiException('INVALID_PROVIDER', 'Unsupported social provider', 400);
    }

    const { user } = req as AuthenticatedRequest;
    const result = await oauthService.unlinkAccount(user.id, provider);
    res.json({ data: result });
  }),
);

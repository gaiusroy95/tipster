import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { getClientIp } from '../lib/client-ip';
import { twoFactorService } from '../services/two-factor.service';
import {
  twoFactorCodeSchema,
  twoFactorDisableSchema,
  twoFactorLoginVerifySchema,
  twoFactorPhoneSchema,
} from '../schemas/two-factor.schemas';

export const twoFactorRouter = Router();

twoFactorRouter.get(
  '/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const status = await twoFactorService.getStatus(user.id);
    res.json({ data: status });
  }),
);

twoFactorRouter.post(
  '/authenticator/setup',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.beginAuthenticatorSetup(user.id, user.email);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/authenticator/confirm',
  requireAuth,
  validateBody(twoFactorCodeSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.confirmAuthenticatorSetup(user.id, req.body.code);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/phone/setup',
  requireAuth,
  validateBody(twoFactorPhoneSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.beginPhoneSetup(user.id, req.body.phoneNumber);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/phone/confirm',
  requireAuth,
  validateBody(twoFactorCodeSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.confirmPhoneSetup(user.id, req.body.code);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/phone/resend-disable',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.sendDisablePhoneCode(user.id);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/disable',
  requireAuth,
  validateBody(twoFactorDisableSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await twoFactorService.disable(user.id, req.body.password, req.body.code);
    res.json({ data: result });
  }),
);

twoFactorRouter.post(
  '/verify-login',
  validateBody(twoFactorLoginVerifySchema),
  asyncHandler(async (req, res) => {
    const result = await twoFactorService.verifyLogin(
      req.body.session,
      req.body.code,
      req.body.trustDevice ?? true,
      getClientIp(req),
    );
    res.json({ data: result });
  }),
);

import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { getClientIp } from '../lib/client-ip';
import {
  checkEmailSchema,
  checkUsernameSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../schemas/auth.schemas';
import { authService } from '../services/auth.service';
import { oauthService } from '../services/oauth.service';

export const authRouter = Router();

authRouter.get(
  '/check-username',
  validateQuery(checkUsernameSchema),
  asyncHandler(async (req, res) => {
    const { username } = req.query as { username: string };
    const result = await authService.checkUsernameAvailability(username);
    res.json({ data: result });
  }),
);

authRouter.get(
  '/check-email',
  validateQuery(checkEmailSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.query as { email: string };
    const result = await authService.checkEmailAvailability(email);
    res.json({ data: result });
  }),
);

authRouter.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body, getClientIp(req));
    res.status(201).json({ data: result });
  }),
);

authRouter.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.body, getClientIp(req));
    res.json({ data: result });
  }),
);

authRouter.post(
  '/resend-verification',
  validateBody(resendVerificationSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.resendVerification(req.body, getClientIp(req));
    res.json({ data: result });
  }),
);

authRouter.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, getClientIp(req));
    res.json({ data: result });
  }),
);

authRouter.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body);
    res.json({ data: result });
  }),
);

authRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body);
    res.json({ data: result });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    res.json({ data: authService.me(user) });
  }),
);

authRouter.get(
  '/linked-accounts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthenticatedRequest;
    const result = await oauthService.getLinkedAccounts(user.id);
    res.json({ data: result });
  }),
);

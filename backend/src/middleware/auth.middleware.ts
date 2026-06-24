import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { ApiException } from '../lib/api-exception';
import { usersService } from '../services/users.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';
}

export function signToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
    const user = await usersService.findById(payload.sub);
    if (!user) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }
    (req as AuthenticatedRequest).user = user;
    next();
  } catch {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  authMiddleware(req, _res, next).catch(next);
}

export function getViewerIdFromRequest(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
    return payload.sub;
  } catch {
    return undefined;
  }
}

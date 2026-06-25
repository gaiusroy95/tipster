import type { User, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { ApiException } from '../lib/api-exception';
import { usersService } from '../services/users.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me';
}

export function signToken(user: Pick<User, 'id' | 'role'>): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  return jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), {
    expiresIn,
  } as jwt.SignOptions);
}

function assertUserActive(user: User): void {
  if (user.isBanned) {
    throw new ApiException('ACCOUNT_BANNED', 'This account has been suspended', 403);
  }
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
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const user = await usersService.findById(payload.sub);
    if (!user) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ code: 'ACCOUNT_BANNED', message: 'This account has been suspended' });
      return;
    }
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof ApiException) {
      res.status(error.status).json({ code: error.code, message: error.message });
      return;
    }
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

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as AuthenticatedRequest).user;
  if (!user || user.role !== 'ADMIN') {
    next(new ApiException('FORBIDDEN', 'Admin access required', 403));
    return;
  }
  next();
}

export function getViewerIdFromRequest(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return payload.sub;
  } catch {
    return undefined;
  }
}

export { assertUserActive };

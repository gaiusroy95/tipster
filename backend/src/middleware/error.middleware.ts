import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import multer from 'multer';
import { ApiException } from '../lib/api-exception';
import { isPrismaConnectionError } from '../lib/prisma';
import { isOutdatedBetSchemaError } from '../lib/prisma-errors';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON in request body',
    });
    return;
  }

  if (err instanceof ApiException) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : err.message,
    });
    return;
  }

  if (err instanceof Error && err.message.includes('Only JPEG')) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'body';
      if (!details[key]) details[key] = [];
      details[key].push(issue.message);
    }
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta as { target?: string[] } | undefined)?.target ?? [];
      if (fields.includes('email')) {
        res.status(409).json({
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        });
        return;
      }
      if (fields.includes('username')) {
        res.status(409).json({
          code: 'USERNAME_EXISTS',
          message: 'Username is already taken',
        });
        return;
      }
      if (fields.includes('ticketReference')) {
        res.status(409).json({
          code: 'TICKET_COLLISION',
          message: 'Could not assign a bet ticket. Please try again.',
        });
        return;
      }
    }

    if (err.code === 'P2021' || err.code === 'P2022') {
      const column = (err.meta as { column?: string } | undefined)?.column ?? '';
      const table = (err.meta as { table?: string } | undefined)?.table ?? '';
      const message = isOutdatedBetSchemaError(err)
        ? 'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.'
        : table.includes('OAuthState')
          ? 'Database schema is outdated (OAuthState). Run npm run prisma:deploy in the backend folder, then restart.'
          : column.includes('avatarUrl')
            ? 'Database schema is outdated (User.avatarUrl). Run npm run prisma:deploy in the backend folder, then restart the server.'
            : 'Database schema is outdated. Run npm run prisma:deploy in the backend folder, then restart the server.';
      res.status(503).json({
        code: 'DATABASE_SCHEMA_OUTDATED',
        message,
      });
      return;
    }

    if (err.code === 'P1001') {
      res.status(503).json({
        code: 'DATABASE_UNAVAILABLE',
        message:
          'Database is temporarily unavailable. Wait a few seconds and try Google sign-in again.',
      });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError && isOutdatedBetSchemaError(err)) {
    res.status(503).json({
      code: 'DATABASE_SCHEMA_OUTDATED',
      message:
        'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.',
    });
    return;
  }

  if (isPrismaConnectionError(err)) {
    res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message:
        'Database is temporarily unavailable. Wait a few seconds and try Google sign-in again.',
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

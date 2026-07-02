import { Prisma } from '@prisma/client';
import { ApiException } from './api-exception';

function prismaErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const column = (error.meta as { column?: string } | undefined)?.column ?? '';
    const table = (error.meta as { table?: string } | undefined)?.table ?? '';
    return `${error.code} ${table} ${column}`.trim();
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isOutdatedBetSchemaError(error: unknown): boolean {
  const message = prismaErrorMessage(error).toLowerCase();
  return (
    message.includes('ticketreference') ||
    message.includes('bigcount') ||
    message.includes('dailybetusage') ||
    message.includes('markettypeconfig')
  );
}

export function toBetPlacementApiException(error: unknown): ApiException | null {
  if (error instanceof ApiException) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const fields = (error.meta as { target?: string[] } | undefined)?.target ?? [];

    if (error.code === 'P2002' && fields.includes('ticketReference')) {
      return new ApiException(
        'TICKET_COLLISION',
        'Could not assign a bet ticket. Please try again.',
        409,
      );
    }

    if (error.code === 'P2022' && isOutdatedBetSchemaError(error)) {
      return new ApiException(
        'DATABASE_SCHEMA_OUTDATED',
        'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.',
        503,
      );
    }

    if (error.code === 'P2021' && isOutdatedBetSchemaError(error)) {
      return new ApiException(
        'DATABASE_SCHEMA_OUTDATED',
        'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.',
        503,
      );
    }
  }

  if (
    error instanceof Prisma.PrismaClientValidationError &&
    isOutdatedBetSchemaError(error)
  ) {
    return new ApiException(
      'DATABASE_SCHEMA_OUTDATED',
      'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.',
      503,
    );
  }

  if (isOutdatedBetSchemaError(error)) {
    return new ApiException(
      'DATABASE_SCHEMA_OUTDATED',
      'Betting is temporarily unavailable while the database is being updated. Please try again in a minute.',
      503,
    );
  }

  return null;
}

import type { WalletTransaction } from '@prisma/client';

export interface WalletTransactionDto {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  betId?: string;
}

export function toWalletTransactionDto(tx: WalletTransaction): WalletTransactionDto {
  const dto: WalletTransactionDto = {
    id: tx.id,
    userId: tx.userId,
    type: tx.type,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  };
  if (tx.betId) dto.betId = tx.betId;
  return dto;
}

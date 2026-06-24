import { prisma } from '../lib/prisma';
import { toWalletTransactionDto } from '../mappers/wallet.mapper';

export const walletService = {
  async getWallet(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      balance: user.balance,
      transactions: transactions.map(toWalletTransactionDto),
    };
  },
};

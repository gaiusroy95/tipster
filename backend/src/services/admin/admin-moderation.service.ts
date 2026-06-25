import { prisma } from '../../lib/prisma';
import { adminAuditService } from './admin-audit.service';

export const adminBetsService = {
  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    matchId?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.matchId ? { matchId: params.matchId } : {}),
      ...(search
        ? {
            OR: [
              { homeTeamName: { contains: search, mode: 'insensitive' as const } },
              { awayTeamName: { contains: search, mode: 'insensitive' as const } },
              { selectionLabel: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.bet.findMany({
        where,
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, username: true, displayName: true },
          },
        },
      }),
      prisma.bet.count({ where }),
    ]);

    return {
      items: items.map((bet) => ({
        id: bet.id,
        userId: bet.userId,
        user: bet.user,
        matchId: bet.matchId,
        marketType: bet.marketType,
        selectionId: bet.selectionId,
        selectionLabel: bet.selectionLabel,
        odds: bet.odds,
        stake: bet.stake,
        potentialReturn: bet.potentialReturn,
        betSize: bet.betSize,
        status: bet.status,
        profitLoss: bet.profitLoss,
        placedAt: bet.placedAt.toISOString(),
        settledAt: bet.settledAt?.toISOString(),
        homeTeamName: bet.homeTeamName,
        awayTeamName: bet.awayTeamName,
        leagueName: bet.leagueName,
      })),
      total,
      page,
      limit,
    };
  },

  async voidBet(adminUserId: string, betId: string, reason?: string) {
    const bet = await prisma.bet.update({
      where: { id: betId },
      data: {
        status: 'void',
        settledAt: new Date(),
        profitLoss: 0,
      },
    });

    await adminAuditService.log({
      adminUserId,
      action: 'bet.void',
      entityType: 'bet',
      entityId: betId,
      metadata: { reason },
    });

    return bet;
  },
};

export const adminForumService = {
  async listPosts(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { body: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, username: true, displayName: true } },
        },
      }),
      prisma.forumPost.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async updatePost(adminUserId: string, postId: string, data: { status?: string }) {
    const post = await prisma.forumPost.update({
      where: { id: postId },
      data,
    });

    await adminAuditService.log({
      adminUserId,
      action: 'forum.post.update',
      entityType: 'forum_post',
      entityId: postId,
      metadata: data as Record<string, unknown>,
    });

    return post;
  },

  async deletePost(adminUserId: string, postId: string) {
    await prisma.forumPost.delete({ where: { id: postId } });
    await adminAuditService.log({
      adminUserId,
      action: 'forum.post.delete',
      entityType: 'forum_post',
      entityId: postId,
    });
  },

  async deleteComment(adminUserId: string, commentId: string) {
    await prisma.forumComment.delete({ where: { id: commentId } });
    await adminAuditService.log({
      adminUserId,
      action: 'forum.comment.delete',
      entityType: 'forum_comment',
      entityId: commentId,
    });
  },
};

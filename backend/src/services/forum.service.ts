import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiException } from '../lib/api-exception';
import {
  FORUM_VIEW_MILESTONE,
  FORUM_VIEW_REWARD_AMOUNT,
} from '../constants/forum.constants';
import type { CreateForumPostInput, UpdateForumPostInput } from '../schemas/forum.schemas';
import { notificationService } from './notification.service';

const AUTHOR_SELECT = {
  id: true,
  displayName: true,
  username: true,
  avatarUrl: true,
  signature: true,
  signatureLink: true,
  signatureMode: true,
  postCount: true,
} as const;

type AuthorRow = Prisma.UserGetPayload<{ select: typeof AUTHOR_SELECT }>;

const POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  category: true,
  attachments: { orderBy: { sortOrder: 'asc' as const } },
  poll: {
    include: {
      options: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
} satisfies Prisma.ForumPostInclude;

type PostRow = Prisma.ForumPostGetPayload<{ include: typeof POST_INCLUDE }>;

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'post';
}

function hashViewerKey(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

function toAuthorDto(user: AuthorRow) {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl ?? undefined,
    signature: user.signature ?? undefined,
    signatureLink: user.signatureLink ?? undefined,
    signatureMode: (user.signatureMode as 'text' | 'banner' | null) ?? undefined,
    postCount: user.postCount,
  };
}

function toCategoryDto(category: PostRow['category']) {
  if (!category) return undefined;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? undefined,
  };
}

function toAttachmentsDto(attachments: PostRow['attachments']) {
  return attachments.map((a) => ({
    id: a.id,
    type: a.type as 'image' | 'link' | 'file',
    url: a.url,
    title: a.title ?? undefined,
  }));
}

function toPollDto(poll: PostRow['poll'], viewerVoteOptionId?: string | null) {
  if (!poll) return undefined;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
  const closed = poll.endsAt ? poll.endsAt < new Date() : false;
  return {
    id: poll.id,
    question: poll.question,
    endsAt: poll.endsAt?.toISOString(),
    closed,
    totalVotes,
    viewerVoteOptionId: viewerVoteOptionId ?? undefined,
    options: poll.options.map((o) => ({
      id: o.id,
      label: o.label,
      voteCount: o.voteCount,
      percentage: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0,
    })),
  };
}

function toPostBase(post: PostRow, viewerVoteOptionId?: string | null) {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    slug: post.slug,
    status: post.status as 'draft' | 'scheduled' | 'published',
    scheduledAt: post.scheduledAt?.toISOString(),
    coverImageUrl: post.coverImageUrl ?? undefined,
    tags: post.tags,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    publishedAt: post.publishedAt.toISOString(),
    author: toAuthorDto(post.author),
    category: toCategoryDto(post.category),
    attachments: toAttachmentsDto(post.attachments),
    poll: toPollDto(post.poll, viewerVoteOptionId),
  };
}

function toPostSummary(post: PostRow) {
  return {
    ...toPostBase(post),
    excerpt: post.body.length > 180 ? `${post.body.slice(0, 180).trim()}…` : post.body,
  };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugifyTitle(title);
  let slug = base;
  let attempt = 0;
  while (attempt < 20) {
    const existing = await prisma.forumPost.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${Date.now().toString(36).slice(-4)}${attempt}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function publishDueScheduledPosts(): Promise<void> {
  const due = await prisma.forumPost.findMany({
    where: { status: 'scheduled', scheduledAt: { lte: new Date() } },
    select: { id: true, authorId: true },
  });
  if (due.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const post of due) {
      await tx.forumPost.update({
        where: { id: post.id },
        data: { status: 'published', publishedAt: new Date() },
      });
      await tx.user.update({
        where: { id: post.authorId },
        data: { postCount: { increment: 1 } },
      });
    }
  });
}

async function getAuthorTotalViews(authorId: string): Promise<number> {
  const result = await prisma.forumPost.aggregate({
    where: { authorId, status: 'published' },
    _sum: { viewCount: true },
  });
  return result._sum.viewCount ?? 0;
}

async function payForumViewMilestone(userId: string, milestone: number): Promise<void> {
  const existing = await prisma.forumViewReward.findUnique({
    where: { userId_milestone: { userId, milestone } },
  });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    const duplicate = await tx.forumViewReward.findUnique({
      where: { userId_milestone: { userId, milestone } },
    });
    if (duplicate) return;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: FORUM_VIEW_REWARD_AMOUNT } },
    });

    await tx.walletTransaction.create({
      data: {
        userId,
        type: 'forum_bonus',
        amount: FORUM_VIEW_REWARD_AMOUNT,
        balanceAfter: updatedUser.balance,
        description: `Forum views milestone — ${milestone.toLocaleString()} views`,
      },
    });

    await tx.forumViewReward.create({
      data: { userId, milestone, amount: FORUM_VIEW_REWARD_AMOUNT },
    });
  });

  await notificationService.create({
    userId,
    type: 'reward',
    title: 'Forum views bonus',
    message: `You reached ${milestone.toLocaleString()} views on your posts and earned ${FORUM_VIEW_REWARD_AMOUNT.toLocaleString()} virtual credits.`,
    link: '/forum',
  });
}

async function processForumViewRewards(authorId: string): Promise<void> {
  const totalViews = await getAuthorTotalViews(authorId);
  const milestonesReached = Math.floor(totalViews / FORUM_VIEW_MILESTONE);
  if (milestonesReached < 1) return;

  const paid = await prisma.forumViewReward.findMany({
    where: { userId: authorId },
    select: { milestone: true },
  });
  const paidSet = new Set(paid.map((r) => r.milestone));

  for (let i = 1; i <= milestonesReached; i += 1) {
    const milestone = i * FORUM_VIEW_MILESTONE;
    if (!paidSet.has(milestone)) {
      await payForumViewMilestone(authorId, milestone);
    }
  }
}

async function getViewerPollVote(pollId: string | undefined, userId?: string) {
  if (!pollId || !userId) return null;
  const vote = await prisma.forumPollVote.findUnique({
    where: { pollId_userId: { pollId, userId } },
    select: { optionId: true },
  });
  return vote?.optionId ?? null;
}

async function assertPostAccess(post: PostRow, viewerId?: string) {
  if (post.status === 'published') return;
  if (!viewerId || viewerId !== post.authorId) {
    throw new ApiException('NOT_FOUND', 'Post not found', 404);
  }
}

async function buildPostCreateData(
  userId: string,
  input: CreateForumPostInput,
): Promise<{
  slug: string;
  publishedAt: Date;
  status: string;
  scheduledAt: Date | null;
}> {
  const slug = await uniqueSlug(input.title);
  const status = input.status ?? 'published';
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  let publishedAt = new Date();
  if (status === 'draft') {
    publishedAt = new Date();
  } else if (status === 'scheduled' && scheduledAt) {
    publishedAt = scheduledAt;
  }
  void userId;
  return { slug, publishedAt, status, scheduledAt };
}

export const forumService = {
  async listCategories() {
    const rows = await prisma.forumCategory.findMany({ orderBy: { sortOrder: 'asc' } });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
    }));
  },

  async listPopularTags(limit = 20) {
    const posts = await prisma.forumPost.findMany({
      where: { status: 'published' },
      select: { tags: true },
    });
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  },

  async listPosts(
    limit: number,
    offset: number,
    filters: { category?: string; tag?: string },
  ) {
    await publishDueScheduledPosts();

    const where: Prisma.ForumPostWhereInput = { status: 'published' };
    if (filters.category) {
      where.category = { slug: filters.category };
    }
    if (filters.tag) {
      where.tags = { has: filters.tag.toLowerCase() };
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
        include: POST_INCLUDE,
      }),
      prisma.forumPost.count({ where }),
    ]);

    return {
      posts: posts.map(toPostSummary),
      total,
      limit,
      offset,
    };
  },

  async listMyPosts(userId: string, status: 'draft' | 'scheduled') {
    await publishDueScheduledPosts();
    const posts = await prisma.forumPost.findMany({
      where: { authorId: userId, status },
      orderBy: { updatedAt: 'desc' },
      include: POST_INCLUDE,
    });
    return posts.map(toPostSummary);
  },

  async getPostBySlug(slug: string, viewerId?: string) {
    await publishDueScheduledPosts();
    const post = await prisma.forumPost.findUnique({
      where: { slug },
      include: POST_INCLUDE,
    });
    if (!post) {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }
    await assertPostAccess(post, viewerId);
    const viewerVoteOptionId = await getViewerPollVote(post.poll?.id, viewerId);
    return toPostBase(post, viewerVoteOptionId);
  },

  async createPost(userId: string, input: CreateForumPostInput) {
    const { slug, publishedAt, status, scheduledAt } = await buildPostCreateData(userId, input);

    if (input.categoryId) {
      const category = await prisma.forumCategory.findUnique({ where: { id: input.categoryId } });
      if (!category) {
        throw new ApiException('INVALID_CATEGORY', 'Category not found', 400);
      }
    }

    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.forumPost.create({
        data: {
          authorId: userId,
          title: input.title,
          body: input.body,
          slug,
          status,
          scheduledAt,
          publishedAt,
          coverImageUrl: input.coverImageUrl,
          categoryId: input.categoryId,
          tags: input.tags ?? [],
          attachments: {
            create: (input.attachments ?? []).map((a, i) => ({
              type: a.type,
              url: a.url,
              title: a.title,
              sortOrder: i,
            })),
          },
          ...(input.poll
            ? {
                poll: {
                  create: {
                    question: input.poll.question,
                    endsAt: input.poll.endsAt ? new Date(input.poll.endsAt) : null,
                    options: {
                      create: input.poll.options.map((label, i) => ({
                        label,
                        sortOrder: i,
                      })),
                    },
                  },
                },
              }
            : {}),
        },
        include: POST_INCLUDE,
      });

      if (status === 'published') {
        await tx.user.update({
          where: { id: userId },
          data: { postCount: { increment: 1 } },
        });
      }

      return created;
    });

    const viewerVoteOptionId = await getViewerPollVote(post.poll?.id, userId);
    return toPostBase(post, viewerVoteOptionId);
  },

  async updatePost(userId: string, postId: string, input: UpdateForumPostInput) {
    const existing = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: { poll: { include: { options: true, votes: true } } },
    });
    if (!existing || existing.authorId !== userId) {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }

    const nextStatus = input.status ?? existing.status;
    const wasPublished = existing.status === 'published';
    const willPublish = nextStatus === 'published' && !wasPublished;

    const post = await prisma.$transaction(async (tx) => {
      if (input.attachments) {
        await tx.forumAttachment.deleteMany({ where: { postId } });
        await tx.forumAttachment.createMany({
          data: input.attachments.map((a, i) => ({
            postId,
            type: a.type,
            url: a.url,
            title: a.title,
            sortOrder: i,
          })),
        });
      }

      const updated = await tx.forumPost.update({
        where: { id: postId },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.body !== undefined ? { body: input.body } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.coverImageUrl !== undefined ? { coverImageUrl: input.coverImageUrl } : {}),
          ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.scheduledAt !== undefined
            ? { scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null }
            : {}),
          ...(willPublish ? { publishedAt: new Date(), status: 'published' } : {}),
        },
        include: POST_INCLUDE,
      });

      if (willPublish) {
        await tx.user.update({
          where: { id: userId },
          data: { postCount: { increment: 1 } },
        });
      }

      return updated;
    });

    const viewerVoteOptionId = await getViewerPollVote(post.poll?.id, userId);
    return toPostBase(post, viewerVoteOptionId);
  },

  async deletePost(userId: string, postId: string) {
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== userId) {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }

    await prisma.$transaction(async (tx) => {
      if (post.status === 'published') {
        await tx.user.update({
          where: { id: userId },
          data: { postCount: { decrement: 1 } },
        });
      }
      await tx.forumPost.delete({ where: { id: postId } });
    });

    return { message: 'Post deleted' };
  },

  async publishPost(userId: string, postId: string) {
    return this.updatePost(userId, postId, { status: 'published' });
  },

  async recordView(
    postId: string,
    options: { userId?: string; clientIp: string },
  ): Promise<{ recorded: boolean; viewCount: number }> {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, viewCount: true, status: true },
    });

    if (!post || post.status !== 'published') {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }

    if (options.userId && options.userId === post.authorId) {
      return { recorded: false, viewCount: post.viewCount };
    }

    const viewerKey = options.userId
      ? `user:${options.userId}`
      : `ip:${hashViewerKey(options.clientIp)}`;

    const existing = await prisma.forumPostView.findUnique({
      where: { postId_viewerKey: { postId, viewerKey } },
    });
    if (existing) {
      return { recorded: false, viewCount: post.viewCount };
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.forumPostView.create({
        data: { postId, viewerKey, userId: options.userId },
      });
      return tx.forumPost.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true, authorId: true },
      });
    });

    void processForumViewRewards(updated.authorId).catch((error) => {
      console.error('[forum] Failed to process view rewards:', error);
    });

    return { recorded: true, viewCount: updated.viewCount };
  },

  async listComments(postId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });
    if (!post || post.status !== 'published') {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }

    const comments = await prisma.forumComment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: AUTHOR_SELECT },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: AUTHOR_SELECT } },
        },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      author: toAuthorDto(c.author),
      replies: c.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        author: toAuthorDto(r.author),
      })),
    }));
  },

  async createComment(
    userId: string,
    postId: string,
    body: string,
    parentId?: string,
  ) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });
    if (!post || post.status !== 'published') {
      throw new ApiException('NOT_FOUND', 'Post not found', 404);
    }

    if (parentId) {
      const parent = await prisma.forumComment.findFirst({
        where: { id: parentId, postId },
      });
      if (!parent) {
        throw new ApiException('NOT_FOUND', 'Parent comment not found', 404);
      }
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.forumComment.create({
        data: { postId, authorId: userId, body, parentId },
        include: { author: { select: AUTHOR_SELECT } },
      });
      await tx.forumPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });
      return created;
    });

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: toAuthorDto(comment.author),
      replies: [],
    };
  },

  async updateComment(userId: string, commentId: string, body: string) {
    const comment = await prisma.forumComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== userId) {
      throw new ApiException('NOT_FOUND', 'Comment not found', 404);
    }

    const updated = await prisma.forumComment.update({
      where: { id: commentId },
      data: { body },
      include: { author: { select: AUTHOR_SELECT } },
    });

    return {
      id: updated.id,
      body: updated.body,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      author: toAuthorDto(updated.author),
    };
  },

  async deleteComment(userId: string, commentId: string) {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
      include: { replies: { select: { id: true } } },
    });
    if (!comment || comment.authorId !== userId) {
      throw new ApiException('NOT_FOUND', 'Comment not found', 404);
    }

    const decrement = 1 + comment.replies.length;

    await prisma.$transaction(async (tx) => {
      await tx.forumComment.delete({ where: { id: commentId } });
      await tx.forumPost.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement } },
      });
    });

    return { message: 'Comment deleted' };
  },

  async votePoll(userId: string, postId: string, optionId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        poll: {
          include: { options: true },
        },
      },
    });

    if (!post || post.status !== 'published' || !post.poll) {
      throw new ApiException('NOT_FOUND', 'Poll not found', 404);
    }

    if (post.poll.endsAt && post.poll.endsAt < new Date()) {
      throw new ApiException('POLL_CLOSED', 'This poll has ended', 400);
    }

    const option = post.poll.options.find((o) => o.id === optionId);
    if (!option) {
      throw new ApiException('INVALID_OPTION', 'Poll option not found', 400);
    }

    const existing = await prisma.forumPollVote.findUnique({
      where: { pollId_userId: { pollId: post.poll.id, userId } },
    });
    if (existing) {
      throw new ApiException('ALREADY_VOTED', 'You already voted in this poll', 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.forumPollVote.create({
        data: { pollId: post.poll!.id, optionId, userId },
      });
      await tx.forumPollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } },
      });
    });

    return this.getPostBySlug(post.slug, userId);
  },

  async getUserForumStats(userId: string) {
    const [totalViews, bonusAgg] = await Promise.all([
      getAuthorTotalViews(userId),
      prisma.forumViewReward.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
    ]);

    const forumBonusEarned = bonusAgg._sum.amount ?? 0;
    const progressInCycle = totalViews % FORUM_VIEW_MILESTONE;
    const forumViewsProgress =
      progressInCycle === 0 && totalViews > 0 ? FORUM_VIEW_MILESTONE : progressInCycle;
    const forumViewsRemaining =
      forumViewsProgress >= FORUM_VIEW_MILESTONE
        ? 0
        : FORUM_VIEW_MILESTONE - forumViewsProgress;

    return {
      forumViewsTotal: totalViews,
      forumViewsProgress,
      forumViewsTarget: FORUM_VIEW_MILESTONE,
      forumViewsRemaining,
      forumBonusEarned,
    };
  },
};

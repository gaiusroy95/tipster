import type {
  CreateForumPostPayload,
  ForumCategory,
  ForumComment,
  ForumPostDetail,
  ForumPostStatus,
  ForumPostSummary,
  PopularTag,
} from '@/features/forum/types/forum'
import { FORUM_VIEW_TARGET, FORUM_VIEW_REWARD } from '@/features/forum/types/forum'
import type { User } from '@/mocks/data/types'

interface MockForumPost extends ForumPostDetail {
  authorId: string
}

interface MockComment extends ForumComment {
  postId: string
  parentId?: string
}

const categories: ForumCategory[] = [
  { id: 'cat-general', name: 'General', slug: 'general', description: 'Open discussion' },
  { id: 'cat-tips', name: 'Tips & Picks', slug: 'tips-picks', description: 'Share your picks' },
  { id: 'cat-strategy', name: 'Strategy', slug: 'strategy', description: 'Betting strategy talk' },
  { id: 'cat-news', name: 'News', slug: 'news', description: 'Sports news and updates' },
]

const posts: MockForumPost[] = []
const comments: MockComment[] = []
const views = new Set<string>()
const pollVotes = new Map<string, string>()
const rewards = new Map<string, Set<number>>()

function slugify(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return base || `post-${Date.now().toString(36)}`
}

function toAuthor(user: User) {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    signature: user.signature,
    signatureLink: user.signatureLink,
    signatureMode: user.signatureMode,
    postCount: user.postCount ?? 0,
  }
}

function findCategory(categoryId?: string) {
  return categoryId ? categories.find((c) => c.id === categoryId) : undefined
}

function toSummary(post: MockForumPost): ForumPostSummary {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.body.length > 180 ? `${post.body.slice(0, 180).trim()}…` : post.body,
    body: post.body,
    slug: post.slug,
    status: post.status,
    scheduledAt: post.scheduledAt,
    coverImageUrl: post.coverImageUrl,
    tags: post.tags,
    viewCount: post.viewCount,
    commentCount: post.commentCount,
    publishedAt: post.publishedAt,
    author: post.author,
    category: post.category,
    attachments: post.attachments,
    poll: post.poll,
  }
}

function getAuthorTotalViews(authorId: string): number {
  return posts
    .filter((p) => p.authorId === authorId && p.status === 'published')
    .reduce((sum, p) => sum + p.viewCount, 0)
}

function payMilestone(
  user: User,
  mockDb: {
    getTransactions: () => import('@/mocks/data/types').WalletTransaction[]
    setTransactions: (tx: import('@/mocks/data/types').WalletTransaction[]) => void
  },
  milestone: number,
) {
  const paid = rewards.get(user.id) ?? new Set<number>()
  if (paid.has(milestone)) return

  user.balance += FORUM_VIEW_REWARD
  paid.add(milestone)
  rewards.set(user.id, paid)

  const tx = mockDb.getTransactions()
  tx.unshift({
    id: `tx-forum-${user.id}-${milestone}`,
    userId: user.id,
    type: 'forum_bonus',
    amount: FORUM_VIEW_REWARD,
    balanceAfter: user.balance,
    description: `Forum views milestone — ${milestone.toLocaleString()} views`,
    createdAt: new Date().toISOString(),
  })
  mockDb.setTransactions(tx)
}

function processRewards(
  authorId: string,
  user: User,
  mockDb: {
    getTransactions: () => import('@/mocks/data/types').WalletTransaction[]
    setTransactions: (tx: import('@/mocks/data/types').WalletTransaction[]) => void
  },
) {
  const total = getAuthorTotalViews(authorId)
  const milestones = Math.floor(total / FORUM_VIEW_TARGET)
  for (let i = 1; i <= milestones; i += 1) {
    payMilestone(user, mockDb, i * FORUM_VIEW_TARGET)
  }
}

function buildCommentTree(postId: string): ForumComment[] {
  const postComments = comments.filter((c) => c.postId === postId && !c.parentId)
  return postComments.map((c) => {
    const { postId: _postId, parentId: _parentId, ...comment } = c
    return {
      ...comment,
      replies: comments
        .filter((r) => r.parentId === c.id)
        .map(({ postId: _p, parentId: _pa, replies: _r, ...reply }) => reply),
    }
  })
}

function recalcPollPercentages(post: MockForumPost) {
  if (!post.poll) return
  const total = post.poll.options.reduce((sum, o) => sum + o.voteCount, 0)
  post.poll.totalVotes = total
  post.poll.options = post.poll.options.map((o) => ({
    ...o,
    percentage: total > 0 ? Math.round((o.voteCount / total) * 100) : 0,
  }))
}

export function getMockForumStats(userId: string) {
  const totalViews = getAuthorTotalViews(userId)
  const paid = rewards.get(userId) ?? new Set<number>()
  const forumBonusEarned = paid.size * FORUM_VIEW_REWARD
  const progressInCycle = totalViews % FORUM_VIEW_TARGET
  const forumViewsProgress =
    progressInCycle === 0 && totalViews > 0 ? FORUM_VIEW_TARGET : progressInCycle
  const forumViewsRemaining =
    forumViewsProgress >= FORUM_VIEW_TARGET ? 0 : FORUM_VIEW_TARGET - forumViewsProgress

  return {
    forumViewsTotal: totalViews,
    forumViewsProgress,
    forumViewsTarget: FORUM_VIEW_TARGET,
    forumViewsRemaining,
    forumBonusEarned,
  }
}

export const mockForum = {
  categories() {
    return categories
  },

  tags(): PopularTag[] {
    const counts = new Map<string, number>()
    for (const post of posts.filter((p) => p.status === 'published')) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  },

  list(limit: number, offset: number, category?: string, tag?: string) {
    let filtered = posts.filter((p) => p.status === 'published')
    if (category) {
      filtered = filtered.filter((p) => p.category?.slug === category)
    }
    if (tag) {
      filtered = filtered.filter((p) => p.tags.includes(tag))
    }
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    return {
      posts: sorted.slice(offset, offset + limit).map(toSummary),
      total: sorted.length,
      limit,
      offset,
    }
  },

  myDrafts(userId: string) {
    return posts
      .filter((p) => p.authorId === userId && p.status === 'draft')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(toSummary)
  },

  myScheduled(userId: string) {
    return posts
      .filter((p) => p.authorId === userId && p.status === 'scheduled')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(toSummary)
  },

  getBySlug(slug: string) {
    const post = posts.find((p) => p.slug === slug && p.status === 'published')
    if (!post) return null
    const { authorId: _authorId, ...detail } = post
    return detail
  },

  getById(id: string) {
    return posts.find((p) => p.id === id) ?? null
  },

  create(user: User, payload: CreateForumPostPayload): ForumPostDetail {
    const id = `forum-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const slug = slugify(payload.title)
    const status: ForumPostStatus = payload.status ?? 'published'
    const now = new Date().toISOString()
    const category = findCategory(payload.categoryId)

    let poll = undefined
    if (payload.poll && payload.poll.options.filter(Boolean).length >= 2) {
      const pollId = `poll-${id}`
      poll = {
        id: pollId,
        question: payload.poll.question,
        endsAt: payload.poll.endsAt,
        closed: false,
        totalVotes: 0,
        options: payload.poll.options
          .filter((o) => o.trim())
          .map((label, i) => ({
            id: `${pollId}-opt-${i}`,
            label: label.trim(),
            voteCount: 0,
            percentage: 0,
          })),
      }
    }

    const post: MockForumPost = {
      id,
      authorId: user.id,
      title: payload.title,
      body: payload.body,
      slug,
      status,
      scheduledAt: payload.scheduledAt,
      coverImageUrl: payload.coverImageUrl,
      tags: payload.tags ?? [],
      viewCount: 0,
      commentCount: 0,
      publishedAt: status === 'scheduled' && payload.scheduledAt ? payload.scheduledAt : now,
      author: {
        ...toAuthor(user),
        postCount: (user.postCount ?? 0) + (status === 'published' ? 1 : 0),
      },
      category,
      attachments: (payload.attachments ?? []).map((a, i) => ({
        id: `att-${id}-${i}`,
        ...a,
      })),
      poll,
    }

    if (status === 'published') {
      user.postCount = (user.postCount ?? 0) + 1
    }

    posts.unshift(post)
    const { authorId: _authorId, ...detail } = post
    return detail
  },

  update(user: User, id: string, payload: Partial<CreateForumPostPayload>): ForumPostDetail | null {
    const post = posts.find((p) => p.id === id)
    if (!post || post.authorId !== user.id) return null

    if (payload.title) {
      post.title = payload.title
      post.slug = slugify(payload.title)
    }
    if (payload.body !== undefined) post.body = payload.body
    if (payload.status) post.status = payload.status
    if (payload.scheduledAt !== undefined) post.scheduledAt = payload.scheduledAt
    if (payload.coverImageUrl !== undefined) post.coverImageUrl = payload.coverImageUrl
    if (payload.categoryId !== undefined) post.category = findCategory(payload.categoryId)
    if (payload.tags) post.tags = payload.tags
    if (payload.attachments) {
      post.attachments = payload.attachments.map((a, i) => ({
        id: `att-${post.id}-${i}`,
        ...a,
      }))
    }

    const { authorId: _authorId, ...detail } = post
    return detail
  },

  publish(user: User, id: string): ForumPostDetail | null {
    const post = posts.find((p) => p.id === id)
    if (!post || post.authorId !== user.id) return null
    post.status = 'published'
    post.publishedAt = new Date().toISOString()
    user.postCount = (user.postCount ?? 0) + 1
    const { authorId: _authorId, ...detail } = post
    return detail
  },

  delete(user: User, id: string): boolean {
    const idx = posts.findIndex((p) => p.id === id)
    if (idx === -1) return false
    if (posts[idx].authorId !== user.id) return false
    posts.splice(idx, 1)
    for (let i = comments.length - 1; i >= 0; i -= 1) {
      if (comments[i].postId === id) comments.splice(i, 1)
    }
    return true
  },

  getComments(postId: string) {
    return buildCommentTree(postId)
  },

  createComment(user: User, postId: string, body: string, parentId?: string): ForumComment | null {
    const post = posts.find((p) => p.id === postId)
    if (!post) return null
    if (parentId && !comments.some((c) => c.id === parentId && c.postId === postId)) return null

    const id = `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date().toISOString()
    const comment: MockComment = {
      id,
      postId,
      parentId,
      body,
      createdAt: now,
      updatedAt: now,
      author: toAuthor(user),
      replies: [],
    }
    comments.push(comment)
    post.commentCount += 1

    const { postId: _postId, parentId: _parentId, ...result } = comment
    return result
  },

  votePoll(user: User, postId: string, optionId: string): ForumPostDetail | null {
    const post = posts.find((p) => p.id === postId)
    if (!post?.poll || post.poll.closed) return null
    const option = post.poll.options.find((o) => o.id === optionId)
    if (!option) return null

    const existing = pollVotes.get(`${user.id}:${postId}`)
    if (existing) {
      const prev = post.poll.options.find((o) => o.id === existing)
      if (prev) prev.voteCount -= 1
    } else {
      post.poll.totalVotes += 1
    }

    option.voteCount += 1
    pollVotes.set(`${user.id}:${postId}`, optionId)
    post.poll.viewerVoteOptionId = optionId
    recalcPollPercentages(post)

    const { authorId: _authorId, ...detail } = post
    return { ...detail, poll: { ...post.poll, viewerVoteOptionId: optionId } }
  },

  recordView(
    postId: string,
    viewerKey: string,
    user: User | null,
    mockDb: {
      getUser: (id: string) => User | undefined
      getTransactions: () => import('@/mocks/data/types').WalletTransaction[]
      setTransactions: (tx: import('@/mocks/data/types').WalletTransaction[]) => void
    },
  ) {
    const post = posts.find((p) => p.id === postId)
    if (!post || post.status !== 'published') return null
    if (user && user.id === post.authorId) {
      return { recorded: false, viewCount: post.viewCount }
    }

    const key = `${postId}:${viewerKey}`
    if (views.has(key)) {
      return { recorded: false, viewCount: post.viewCount }
    }

    views.add(key)
    post.viewCount += 1

    const author = mockDb.getUser(post.authorId)
    if (author) {
      processRewards(post.authorId, author, mockDb)
    }

    return { recorded: true, viewCount: post.viewCount }
  },
}

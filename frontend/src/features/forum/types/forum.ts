export const FORUM_VIEW_TARGET = 1000
export const FORUM_VIEW_REWARD = 2000

export type ForumPostStatus = 'draft' | 'scheduled' | 'published'

export interface ForumAuthor {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
  signature?: string
  signatureLink?: string
  signatureMode?: 'text' | 'banner'
  postCount: number
}

export interface ForumCategory {
  id: string
  name: string
  slug: string
  description?: string
}

export interface ForumAttachment {
  id: string
  type: 'image' | 'link' | 'file'
  url: string
  title?: string
}

export interface ForumPollOption {
  id: string
  label: string
  voteCount: number
  percentage: number
}

export interface ForumPoll {
  id: string
  question: string
  endsAt?: string
  closed: boolean
  totalVotes: number
  viewerVoteOptionId?: string
  options: ForumPollOption[]
}

export interface ForumPostSummary {
  id: string
  title: string
  excerpt: string
  body: string
  slug: string
  status: ForumPostStatus
  scheduledAt?: string
  coverImageUrl?: string
  tags: string[]
  viewCount: number
  commentCount: number
  publishedAt: string
  author: ForumAuthor
  category?: ForumCategory
  attachments: ForumAttachment[]
  poll?: ForumPoll
}

export interface ForumPostDetail extends Omit<ForumPostSummary, 'excerpt'> {}

export interface ForumPostListResponse {
  posts: ForumPostSummary[]
  total: number
  limit: number
  offset: number
}

export interface ForumComment {
  id: string
  body: string
  createdAt: string
  updatedAt: string
  author: ForumAuthor
  replies: Omit<ForumComment, 'replies'>[]
}

export interface ForumViewStats {
  forumViewsTotal: number
  forumViewsProgress: number
  forumViewsTarget: number
  forumViewsRemaining: number
  forumBonusEarned: number
}

export interface CreateForumPostPayload {
  title: string
  body: string
  status?: ForumPostStatus
  scheduledAt?: string
  coverImageUrl?: string
  categoryId?: string
  tags?: string[]
  attachments?: { type: 'image' | 'link' | 'file'; url: string; title?: string }[]
  poll?: { question: string; options: string[]; endsAt?: string }
}

export interface PopularTag {
  tag: string
  count: number
}

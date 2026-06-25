export interface AdminForumPost {
  id: string
  authorId: string
  title: string
  body: string
  slug: string
  status: string
  scheduledAt: string | null
  coverImageUrl: string | null
  categoryId: string | null
  tags: string[]
  viewCount: number
  commentCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  author: { id: string; username: string; displayName: string }
}

export type ForumStatusFilter = 'all' | 'published' | 'hidden'

export const FORUM_STATUS_FILTERS: { value: ForumStatusFilter; label: string }[] = [
  { value: 'all', label: 'All threads' },
  { value: 'published', label: 'Live' },
  { value: 'hidden', label: 'Hidden' },
]

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatPostDate(iso)
}

export function excerpt(body: string, maxLength = 140) {
  const plain = body.replace(/\s+/g, ' ').trim()
  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength).trim()}…`
}

export function getPostStatusStyle(status: string) {
  if (status === 'hidden') {
    return {
      label: 'Hidden',
      badge: 'loss' as const,
      accent: 'border-accent-loss/40 bg-accent-loss/10',
      bar: 'bg-accent-loss',
      glow: 'shadow-[0_0_24px_rgba(248,113,113,0.12)]',
    }
  }
  return {
    label: status === 'published' ? 'Live' : status,
    badge: 'win' as const,
    accent: 'border-accent-win/30 bg-accent-win/10',
    bar: 'bg-accent-win',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.1)]',
  }
}

export function summarizeForumPosts(posts: AdminForumPost[], total: number) {
  const hidden = posts.filter((p) => p.status === 'hidden').length
  const views = posts.reduce((sum, p) => sum + p.viewCount, 0)
  const comments = posts.reduce((sum, p) => sum + p.commentCount, 0)
  const authors = new Set(posts.map((p) => p.authorId)).size

  return {
    total,
    loaded: posts.length,
    hidden,
    published: posts.filter((p) => p.status === 'published').length,
    views,
    comments,
    authors,
  }
}

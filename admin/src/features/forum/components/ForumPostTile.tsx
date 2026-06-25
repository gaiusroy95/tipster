import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline'
import {
  excerpt,
  formatRelativeTime,
  getPostStatusStyle,
  type AdminForumPost,
} from '@/features/forum/lib/forumUtils'
import { Badge } from '@/shared/components/Badge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

export function ForumPostTile({
  post,
  selected,
  onSelect,
}: {
  post: AdminForumPost
  selected: boolean
  onSelect: (post: AdminForumPost) => void
}) {
  const style = getPostStatusStyle(post.status)
  const isHidden = post.status === 'hidden'

  return (
    <button
      type="button"
      onClick={() => onSelect(post)}
      className={cn(
        'forum-mosaic-tile group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-live/50',
        selected
          ? 'border-accent-live/40 bg-bg-elevated/80 ring-2 ring-accent-live/25'
          : 'border-border-default/60 bg-bg-surface/70 hover:bg-bg-elevated/50',
        style.glow,
        isHidden && 'opacity-80',
      )}
    >
      <div className={cn('absolute left-0 top-0 h-full w-1', style.bar)} aria-hidden="true" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={post.author.displayName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{post.author.displayName}</p>
              <p className="truncate text-[11px] text-text-muted">@{post.author.username}</p>
            </div>
          </div>
          <Badge variant={style.badge}>{style.label}</Badge>
        </div>

        <h3 className="mt-4 font-display text-lg font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-accent-live/90 transition-colors">
          {post.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-3">
          {excerpt(post.body, 160)}
        </p>

        {post.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-border-default/60 bg-bg-primary/40 px-2 py-0.5 text-[10px] font-medium text-text-muted"
              >
                <HashtagIcon className="h-3 w-3 opacity-60" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-default/40 pt-3 text-[11px] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {post.viewCount.toLocaleString()} views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {post.commentCount.toLocaleString()} replies
          </span>
          <span className="ml-auto font-medium">{formatRelativeTime(post.publishedAt)}</span>
        </div>
      </div>

      {selected ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent-live via-accent-secondary to-accent-primary"
          aria-hidden="true"
        />
      ) : null}
    </button>
  )
}

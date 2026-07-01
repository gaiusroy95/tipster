import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { playerPath, forumPostPath } from '@/core/constants/routes'
import { formatRelativeTime } from '@/shared/utils/formatDate'
import type { ForumPostSummary } from '@/features/forum/types/forum'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

function StatPill({ icon: Icon, children }: { icon: typeof EyeIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-bg-elevated/70 px-2 py-1 text-xs text-text-muted">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}

export function ForumPostCard({
  post,
  className,
  showStatus,
  onPublish,
}: {
  post: ForumPostSummary
  className?: string
  showStatus?: boolean
  onPublish?: () => void
}) {
  const canOpen = post.status === 'published'
  const hasCover = !!post.coverImageUrl

  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {post.category && (
          <span className="rounded-md bg-accent-secondary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-secondary">
            {post.category.name}
          </span>
        )}
        {showStatus && (
          <span className="rounded-md border border-accent-gold/30 bg-accent-gold/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-gold capitalize">
            {post.status}
          </span>
        )}
        {post.poll && (
          <span className="inline-flex items-center gap-1 rounded-md bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-muted">
            <ChartBarIcon className="h-3 w-3" aria-hidden="true" />
            Poll
          </span>
        )}
      </div>

      <h2 className="font-display text-lg sm:text-xl font-bold text-text-primary leading-snug group-hover:text-accent-secondary transition-colors">
        {post.title}
      </h2>

      <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2 sm:line-clamp-3">
        {post.excerpt}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-default/60 px-2 py-0.5 text-[11px] text-text-muted"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 4 && (
            <span className="text-[11px] text-text-muted">+{post.tags.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatPill icon={EyeIcon}>{(post.viewCount ?? 0).toLocaleString()}</StatPill>
        <StatPill icon={ChatBubbleLeftIcon}>{post.commentCount.toLocaleString()}</StatPill>
        {post.attachments.length > 0 && (
          <StatPill icon={PaperClipIcon}>{post.attachments.length}</StatPill>
        )}
        {canOpen && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity">
            Read post
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  )

  return (
    <article
      className={cn(
        'group rounded-2xl border border-border-default/70 bg-bg-surface shadow-card overflow-hidden transition-all duration-200',
        canOpen && 'hover:border-accent-secondary/35 hover:shadow-glow-accent',
        className,
      )}
    >
      <div className={cn('flex flex-col', hasCover && 'sm:flex-row')}>
        {hasCover && (
          <div className={cn('relative shrink-0 sm:w-44 lg:w-52', canOpen && 'sm:order-last')}>
            {canOpen ? (
              <Link to={forumPostPath(post.slug)} className="block h-full min-h-[140px] sm:min-h-full">
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-40 sm:h-full w-full object-cover sm:min-h-[180px]"
                />
              </Link>
            ) : (
              <img
                src={post.coverImageUrl}
                alt=""
                className="h-40 sm:h-full w-full object-cover sm:min-h-[180px]"
              />
            )}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <Link to={playerPath(post.author.id)} className="shrink-0">
              <ProfileAvatar
                name={post.author.displayName}
                avatarUrl={post.author.avatarUrl}
                className="h-9 w-9 ring-2 ring-border-default/50"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={playerPath(post.author.id)}
                className="block truncate text-sm font-semibold text-text-primary hover:text-accent-secondary transition-colors"
              >
                {post.author.displayName}
              </Link>
              <p className="truncate text-xs text-text-muted">
                @{post.author.username}
                <span aria-hidden="true"> · </span>
                <time dateTime={post.publishedAt}>{formatRelativeTime(post.publishedAt)}</time>
              </p>
            </div>
          </div>

          {canOpen ? (
            <Link to={forumPostPath(post.slug)} className="block flex-1">
              {content}
            </Link>
          ) : (
            <div className="flex-1">
              {content}
              {onPublish && (
                <Button size="sm" className="mt-4" onClick={onPublish}>
                  Publish now
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

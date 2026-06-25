import { useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  HashtagIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import {
  formatPostDate,
  getPostStatusStyle,
  type AdminForumPost,
} from '@/features/forum/lib/forumUtils'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/Button'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

export function ForumSpotlightPanel({
  post,
  onHideToggle,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  post: AdminForumPost | null
  onHideToggle: (post: AdminForumPost) => void
  onDelete: (post: AdminForumPost) => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setConfirmDelete(false)
  }, [post?.id])

  if (!post) {
    return (
      <aside className="forum-spotlight relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-border-default/60 bg-bg-surface/50 p-8 text-center lg:sticky lg:top-6 lg:min-h-[calc(100vh-8rem)]">
        <div
          className="pointer-events-none absolute inset-0 forum-spotlight-idle opacity-70"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-accent-live/20 bg-gradient-to-br from-accent-live/15 to-accent-secondary/10">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-accent-live" aria-hidden="true" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">Pick a thread</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
            Select any post from the mosaic to preview its full content, review engagement, and
            moderate with one click.
          </p>
          <ul className="mx-auto mt-8 max-w-xs space-y-2 text-left text-xs text-text-muted">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-win" />
              Hide posts to remove them from public view
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-loss" />
              Delete permanently when moderation is final
            </li>
          </ul>
        </div>
      </aside>
    )
  }

  const style = getPostStatusStyle(post.status)
  const isHidden = post.status === 'hidden'

  return (
    <aside
      className={cn(
        'forum-spotlight relative overflow-hidden rounded-[1.75rem] border lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto admin-sidebar-scroll',
        style.accent,
        'border-border-default/60 bg-bg-surface/80',
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent-live/10 to-transparent"
        aria-hidden="true"
      />

      <div className="relative border-b border-border-default/50 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge variant={style.badge}>{style.label}</Badge>
          <time className="text-xs text-text-muted" dateTime={post.publishedAt}>
            {formatPostDate(post.publishedAt)}
          </time>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <UserAvatar name={post.author.displayName} size="md" />
          <div>
            <p className="font-semibold">{post.author.displayName}</p>
            <p className="text-sm text-text-muted">@{post.author.username}</p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-px border-b border-border-default/50 bg-border-default/30">
        {[
          { label: 'Views', value: post.viewCount, icon: EyeIcon },
          { label: 'Replies', value: post.commentCount, icon: ChatBubbleLeftRightIcon },
          { label: 'Tags', value: post.tags.length, icon: HashtagIcon },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-bg-surface/90 px-4 py-3 text-center">
              <Icon className="mx-auto h-4 w-4 text-text-muted" aria-hidden="true" />
              <p className="mt-1 font-display text-lg font-bold tabular-nums">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="relative px-5 py-5 sm:px-6">
        {post.tags.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border-default/60 bg-bg-primary/50 px-2.5 py-1 text-xs text-text-muted"
              >
                <HashtagIcon className="h-3 w-3" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="forum-post-body rounded-2xl border border-border-default/50 bg-bg-primary/40 p-4 sm:p-5">
          <p className="whitespace-pre-wrap text-sm leading-[1.75] text-text-primary/95">{post.body}</p>
        </div>

        {post.coverImageUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border-default/50">
            <img
              src={post.coverImageUrl}
              alt=""
              className="max-h-48 w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-border-default/50 bg-bg-surface/95 px-5 py-4 backdrop-blur-md sm:px-6">
        {confirmDelete ? (
          <div className="rounded-xl border border-accent-loss/30 bg-accent-loss/10 p-4">
            <div className="flex items-start gap-3">
              <ShieldExclamationIcon className="h-5 w-5 shrink-0 text-accent-loss" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-accent-loss">Delete permanently?</p>
                <p className="mt-1 text-xs text-text-muted">
                  This removes the thread and cannot be undone.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(post)}
                    isLoading={isDeleting}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    Confirm delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onHideToggle(post)}
              isLoading={isUpdating}
            >
              {isHidden ? 'Restore to live' : 'Hide from arena'}
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none"
              onClick={() => setConfirmDelete(true)}
              disabled={isDeleting}
            >
              <TrashIcon className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}

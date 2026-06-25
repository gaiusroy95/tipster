import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { ForumPostTile } from '@/features/forum/components/ForumPostTile'
import type { AdminForumPost } from '@/features/forum/lib/forumUtils'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Card'

export function ForumMosaicGrid({
  posts,
  selectedId,
  onSelect,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: {
  posts: AdminForumPost[]
  selectedId: string | null
  onSelect: (post: AdminForumPost) => void
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  isLoadingMore: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="forum-mosaic-empty flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default/70 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-live/20 bg-accent-live/10">
          <ChatBubbleLeftRightIcon className="h-7 w-7 text-accent-live" aria-hidden="true" />
        </div>
        <p className="mt-4 font-display text-lg font-bold">No threads match</p>
        <p className="mt-2 max-w-xs text-sm text-text-muted">
          Adjust your filters or search — new community posts will land here automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          Thread mosaic
        </p>
        <p className="text-xs text-text-muted tabular-nums">{posts.length} loaded</p>
      </div>

      <div className="space-y-3">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="forum-mosaic-stagger"
            style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
          >
            <ForumPostTile
              post={post}
              selected={selectedId === post.id}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="pt-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onLoadMore}
            isLoading={isLoadingMore}
          >
            Load more threads
          </Button>
        </div>
      ) : null}
    </div>
  )
}

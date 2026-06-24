import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ROUTES, forumPostPath, loginPath } from '@/core/constants/routes'
import {
  useCreateForumPost,
  useForumCategories,
  useForumPosts,
  useForumTags,
  useMyForumDrafts,
  useMyForumScheduled,
  usePublishForumPost,
} from '@/features/forum/hooks/useForum'
import { ForumPostCard } from '@/features/forum/components/ForumPostCard'
import { ForumPostComposer } from '@/features/forum/components/ForumPostComposer'
import { ForumPageHeader } from '@/features/forum/components/ForumPageHeader'
import { ForumSidebar, type ForumTab } from '@/features/forum/components/ForumSidebar'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'
import { ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import type { CreateForumPostPayload } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  )
}

export function ForumPage() {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState<ForumTab>('published')
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')

  const { data: categories } = useForumCategories()
  const { data: popularTags } = useForumTags()
  const { data, isLoading, isError, refetch } = useForumPosts({
    category: category || undefined,
    tag: tag || undefined,
  })
  const { data: drafts, isLoading: draftsLoading } = useMyForumDrafts(!!token && tab === 'drafts')
  const { data: scheduled, isLoading: scheduledLoading } = useMyForumScheduled(!!token && tab === 'scheduled')
  const createPost = useCreateForumPost()
  const publishPost = usePublishForumPost()

  const handleCreate = async (payload: CreateForumPostPayload) => {
    if (!token) {
      navigate(loginPath(ROUTES.FORUM))
      return
    }
    try {
      const post = await createPost.mutateAsync(payload)
      toast(
        payload.status === 'draft'
          ? 'Draft saved'
          : payload.status === 'scheduled'
            ? 'Post scheduled'
            : 'Post published',
        'success',
      )
      setShowForm(false)
      if (payload.status === 'published') {
        navigate(forumPostPath(post.slug))
      } else {
        setTab(payload.status === 'scheduled' ? 'scheduled' : 'drafts')
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not save post', 'error')
    }
  }

  const list = tab === 'published' ? data?.posts : tab === 'drafts' ? drafts : scheduled
  const listLoading =
    tab === 'published' ? isLoading : tab === 'drafts' ? draftsLoading : scheduledLoading

  const feedTitle =
    tab === 'published'
      ? category
        ? categories?.find((c) => c.slug === category)?.name ?? 'Filtered posts'
        : tag
          ? `#${tag}`
          : 'Latest posts'
      : tab === 'drafts'
        ? 'Your drafts'
        : 'Scheduled posts'

  const handleTabChange = (next: ForumTab) => {
    setTab(next)
    if (next !== 'published') {
      setCategory('')
      setTag('')
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <ForumPageHeader
        isAuthenticated={!!token}
        showComposer={showForm}
        onToggleComposer={() => setShowForm((v) => !v)}
        onSignIn={() => navigate(loginPath(ROUTES.FORUM))}
      />

      {showForm && token && (
        <div className="transition-opacity duration-200">
          <ForumPostComposer
            onSubmit={handleCreate}
            isLoading={createPost.isPending}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <ForumSidebar
          tab={tab}
          onTabChange={handleTabChange}
          isAuthenticated={!!token}
          categories={categories}
          popularTags={popularTags}
          activeCategory={category}
          activeTag={tag}
          onCategoryChange={setCategory}
          onTagChange={setTag}
          postCount={tab === 'published' ? data?.total : undefined}
        />

        <main className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-border-default/60 pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">{feedTitle}</h2>
              {tab === 'published' && (category || tag) && (
                <p className="mt-0.5 text-xs text-text-muted">
                  {data?.total ?? 0} result{(data?.total ?? 0) !== 1 ? 's' : ''}
                  {(category || tag) && (
                    <>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => {
                          setCategory('')
                          setTag('')
                        }}
                        className="text-accent-secondary hover:underline font-medium"
                      >
                        Clear filters
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
            {token && !showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-accent-secondary hover:text-accent-primary transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                New post
              </button>
            )}
          </div>

          {tab === 'published' && isError && <QueryErrorFallback onRetry={() => refetch()} />}

          {listLoading && <FeedSkeleton />}

          {!listLoading && (!list || list.length === 0) && (
            <div
              className={cn(
                'rounded-2xl border border-dashed border-border-default/70 bg-bg-surface/50',
              )}
            >
              <EmptyState
                title={tab === 'published' ? 'No posts yet' : tab === 'drafts' ? 'No drafts saved' : 'Nothing scheduled'}
                description={
                  tab === 'published'
                    ? category || tag
                      ? 'Try a different category or tag, or be the first to post here.'
                      : 'Start the conversation — share a pick, strategy note, or match analysis.'
                    : tab === 'drafts'
                      ? 'Save a post as draft while you work on it, then publish when ready.'
                      : 'Schedule a post to go live automatically at a future time.'
                }
                icon={<ChatBubbleLeftRightIcon className="h-12 w-12 opacity-60" />}
                action={
                  token && tab === 'published'
                    ? { label: 'Write the first post', onClick: () => setShowForm(true) }
                    : undefined
                }
              />
            </div>
          )}

          {!listLoading && list && list.length > 0 && (
            <div className="space-y-4">
              {list.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  showStatus={tab !== 'published'}
                  onPublish={
                    tab !== 'published'
                      ? () =>
                          void publishPost
                            .mutateAsync(post.id)
                            .then(() => toast('Published', 'success'))
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

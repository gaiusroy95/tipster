import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { ROUTES } from '@/core/constants/routes'
import {
  useForumComments,
  useForumPost,
  useRecordForumView,
} from '@/features/forum/hooks/useForum'
import { ForumAuthorHeader, ForumAuthorSignature } from '@/features/forum/components/ForumAuthorBlock'
import { ForumAttachments, ForumCoverImage, ForumTags } from '@/features/forum/components/ForumMedia'
import { ForumPollWidget } from '@/features/forum/components/ForumPollWidget'
import { ForumCommentsSection } from '@/features/forum/components/ForumCommentsSection'
import { formatRelativeTime } from '@/shared/utils/formatDate'

export function ForumPostPage() {
  const { slug = '' } = useParams()
  const { data, isLoading, isError, refetch } = useForumPost(slug)
  const { data: comments = [] } = useForumComments(data?.id ?? '')
  const recordView = useRecordForumView()
  const recordedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!data?.id || data.status !== 'published' || recordedRef.current === data.id) return
    recordedRef.current = data.id
    recordView.mutate(data.id)
  }, [data?.id, data?.status, recordView])

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="pb-8">
        <QueryErrorFallback onRetry={() => refetch()} />
      </div>
    )
  }

  const viewCount = recordView.data?.viewCount ?? data.viewCount

  return (
    <div className="space-y-6 pb-8">
      <Link
        to={ROUTES.FORUM}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-accent-secondary transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back to forum
      </Link>

      <article className="overflow-hidden rounded-2xl border border-border-default/70 bg-bg-surface shadow-card">
        {data.coverImageUrl && (
          <div className="border-b border-border-default/50">
            <ForumCoverImage url={data.coverImageUrl} title={data.title} />
          </div>
        )}

        <div className="p-5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {data.category && (
              <span className="rounded-md bg-accent-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-secondary">
                {data.category.name}
              </span>
            )}
            <time className="text-xs text-text-muted" dateTime={data.publishedAt}>
              {formatRelativeTime(data.publishedAt)}
            </time>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-tight">
            {data.title}
          </h1>

          <div className="mt-5 pb-6 border-b border-border-default/50">
            <ForumAuthorHeader author={data.author} publishedAt={data.publishedAt} />
          </div>

          <div className="mt-6 prose prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-base sm:text-lg text-text-primary leading-relaxed">
              {data.body}
            </p>
          </div>

          <ForumAttachments attachments={data.attachments} />
          <ForumTags tags={data.tags} />
          {data.poll && <ForumPollWidget postId={data.id} poll={data.poll} />}
          <ForumAuthorSignature author={data.author} />

          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl bg-bg-elevated/40 px-4 py-3 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="h-4 w-4 text-accent-secondary" aria-hidden="true" />
              <strong className="font-semibold text-text-primary">{viewCount.toLocaleString()}</strong> views
            </span>
            <span className="h-4 w-px bg-border-default" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5">
              <ChatBubbleLeftIcon className="h-4 w-4 text-accent-secondary" aria-hidden="true" />
              <strong className="font-semibold text-text-primary">{data.commentCount.toLocaleString()}</strong> comments
            </span>
          </div>
        </div>
      </article>

      <ForumCommentsSection postId={data.id} comments={comments} key={comments.length} />
    </div>
  )
}

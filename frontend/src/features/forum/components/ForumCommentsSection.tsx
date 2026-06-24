import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useCreateForumComment } from '@/features/forum/hooks/useForum'
import type { ForumComment } from '@/features/forum/types/forum'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { playerPath, loginPath, ROUTES } from '@/core/constants/routes'
import { Button } from '@/shared/components/ui/Button'
import { formatRelativeTime } from '@/shared/utils/formatDate'
import { useToast } from '@/shared/components/ui/Toast'
import { ApiError } from '@/core/types/api'

function CommentItem({
  comment,
  postId,
  depth = 0,
}: {
  comment: ForumComment | Omit<ForumComment, 'replies'>
  postId: string
  depth?: number
}) {
  const token = useAuthStore((s) => s.token)
  const createComment = useCreateForumComment(postId)
  const { toast } = useToast()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')

  const submitReply = async () => {
    if (!replyBody.trim()) return
    try {
      await createComment.mutateAsync({ body: replyBody.trim(), parentId: comment.id })
      setReplyBody('')
      setReplyOpen(false)
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not post reply', 'error')
    }
  }

  return (
    <div className={depth > 0 ? 'ml-4 sm:ml-8 pl-3 border-l border-border-default/50' : ''}>
      <div className="flex gap-3 py-3">
        <Link to={playerPath(comment.author.id)} className="shrink-0">
          <ProfileAvatar name={comment.author.displayName} avatarUrl={comment.author.avatarUrl} className="h-8 w-8 text-xs" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
            <Link to={playerPath(comment.author.id)} className="font-semibold text-text-primary hover:text-accent-secondary">
              {comment.author.displayName}
            </Link>
            <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
          </div>
          <p className="mt-1 text-sm text-text-primary whitespace-pre-wrap">{comment.body}</p>
          {depth === 0 && token && (
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="mt-1 text-xs font-medium text-accent-secondary hover:underline"
            >
              Reply
            </button>
          )}
          {replyOpen && (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 text-sm"
                placeholder="Write a reply…"
              />
              <Button size="sm" isLoading={createComment.isPending} onClick={() => void submitReply()}>
                Post reply
              </Button>
            </div>
          )}
        </div>
      </div>
      {'replies' in comment &&
        comment.replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
        ))}
    </div>
  )
}

export function ForumCommentsSection({
  postId,
  comments,
}: {
  postId: string
  comments: ForumComment[]
}) {
  const token = useAuthStore((s) => s.token)
  const createComment = useCreateForumComment(postId)
  const { toast } = useToast()
  const [body, setBody] = useState('')

  const submit = async () => {
    if (!body.trim()) return
    try {
      await createComment.mutateAsync({ body: body.trim() })
      setBody('')
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not post comment', 'error')
    }
  }

  return (
    <section className="rounded-2xl border border-border-default/70 bg-bg-surface shadow-card p-4 sm:p-6">
      <h2 className="font-display text-lg font-bold text-text-primary mb-4 pb-3 border-b border-border-default/50">
        Discussion
        <span className="ml-2 text-sm font-normal text-text-muted">
          ({comments.reduce((n, c) => n + 1 + c.replies.length, 0)})
        </span>
      </h2>

      {token ? (
        <div className="mb-4 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Join the discussion…"
            className="w-full rounded-lg border border-border-default bg-bg-elevated px-3 py-2 text-sm"
          />
          <Button size="sm" isLoading={createComment.isPending} onClick={() => void submit()} disabled={!body.trim()}>
            Post comment
          </Button>
        </div>
      ) : (
        <p className="mb-4 text-sm text-text-muted">
          <Link to={loginPath(ROUTES.FORUM)} className="text-accent-secondary hover:underline font-medium">
            Sign in
          </Link>{' '}
          to comment.
        </p>
      )}

      <div className="divide-y divide-border-default/40">
        {comments.length === 0 ? (
          <p className="py-6 text-sm text-text-muted text-center">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} postId={postId} />)
        )}
      </div>
    </section>
  )
}

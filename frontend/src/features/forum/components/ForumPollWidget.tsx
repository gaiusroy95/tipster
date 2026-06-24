import { useState } from 'react'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useVoteForumPoll } from '@/features/forum/hooks/useForum'
import type { ForumPoll } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'

export function ForumPollWidget({ postId, poll }: { postId: string; poll: ForumPoll }) {
  const token = useAuthStore((s) => s.token)
  const vote = useVoteForumPoll(postId)
  const [localPoll, setLocalPoll] = useState(poll)

  const hasVoted = !!localPoll.viewerVoteOptionId
  const disabled = !token || hasVoted || localPoll.closed || vote.isPending

  const handleVote = async (optionId: string) => {
    if (disabled) return
    const updated = await vote.mutateAsync(optionId)
    if (updated.poll) setLocalPoll(updated.poll)
  }

  return (
    <div className="mt-6 rounded-xl border border-border-default/60 bg-bg-elevated/40 p-4">
      <p className="font-semibold text-text-primary mb-3">{localPoll.question}</p>
      <div className="space-y-2">
        {localPoll.options.map((option) => {
          const selected = localPoll.viewerVoteOptionId === option.id
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => void handleVote(option.id)}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                selected
                  ? 'border-accent-secondary/50 bg-accent-secondary/10'
                  : 'border-border-default/60 hover:border-accent-secondary/30',
                disabled && !selected && 'opacity-70 cursor-default',
              )}
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className={cn('font-medium', selected && 'text-accent-secondary')}>{option.label}</span>
                {(hasVoted || localPoll.closed) && (
                  <span className="text-text-muted tabular-nums">{option.percentage}%</span>
                )}
              </div>
              {(hasVoted || localPoll.closed) && (
                <div className="mt-2 h-1.5 rounded-full bg-bg-primary/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-secondary"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {localPoll.totalVotes.toLocaleString()} vote{localPoll.totalVotes !== 1 ? 's' : ''}
        {localPoll.closed ? ' · Poll closed' : ''}
        {!token && !localPoll.closed ? ' · Sign in to vote' : ''}
      </p>
    </div>
  )
}

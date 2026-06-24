import { Link } from 'react-router-dom'
import type { ForumAuthor } from '@/features/forum/types/forum'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { playerPath } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

export function ForumAuthorSignature({ author }: { author: ForumAuthor }) {
  if (!author.signature) return null

  const content =
    author.signatureMode === 'banner' && author.signatureLink ? (
      <a
        href={author.signatureLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-border-default/50"
      >
        <img src={author.signature} alt="" className="max-h-24 w-full object-cover" />
      </a>
    ) : (
      <p className="text-sm italic text-text-muted">{author.signature}</p>
    )

  return (
    <div className="mt-4 rounded-lg border border-border-default/40 bg-bg-elevated/40 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Signature</p>
      {content}
    </div>
  )
}

export function ForumAuthorHeader({ author, publishedAt }: { author: ForumAuthor; publishedAt: string }) {
  return (
    <div className="flex items-start gap-3">
      <Link to={playerPath(author.id)} className="shrink-0">
        <ProfileAvatar name={author.displayName} avatarUrl={author.avatarUrl} className="h-12 w-12" />
      </Link>
      <div className="min-w-0">
        <Link
          to={playerPath(author.id)}
          className={cn('font-semibold text-text-primary hover:text-accent-secondary transition-colors')}
        >
          {author.displayName}
        </Link>
        <p className="text-sm text-text-muted">@{author.username}</p>
        <time className="text-xs text-text-muted" dateTime={publishedAt}>
          {new Date(publishedAt).toLocaleString()}
        </time>
      </div>
    </div>
  )
}

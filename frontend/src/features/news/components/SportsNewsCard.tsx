import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { SportsNewsItem } from '@/features/news/types/news'
import { formatRelativeTime } from '@/shared/utils/formatDate'
import { cn } from '@/shared/utils/cn'

export function SportsNewsCard({
  item,
  compact = false,
}: {
  item: SportsNewsItem
  compact?: boolean
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col rounded-xl border border-border-default/80 bg-bg-elevated/60 transition-colors hover:border-accent-secondary/40 hover:bg-bg-elevated',
        compact ? 'p-2.5' : 'p-3',
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-lg bg-bg-surface',
          compact ? 'aspect-[16/10]' : 'aspect-[16/9]',
        )}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">No image</div>
        )}
      </div>

      <h3
        className={cn(
          'mt-2 font-semibold leading-snug text-text-primary line-clamp-2 group-hover:text-accent-primary',
          compact ? 'text-xs' : 'text-sm',
        )}
      >
        {item.headline}
      </h3>

      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-text-muted">
        <span className="font-medium truncate">{item.source}</span>
        <span className="flex items-center gap-1 shrink-0">
          {formatRelativeTime(item.publishedAt)}
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

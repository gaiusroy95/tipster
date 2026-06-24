import type { ForumAttachment } from '@/features/forum/types/forum'
import { cn } from '@/shared/utils/cn'

export function ForumAttachments({ attachments }: { attachments: ForumAttachment[] }) {
  if (attachments.length === 0) return null

  const images = attachments.filter((a) => a.type === 'image')
  const links = attachments.filter((a) => a.type === 'link' || a.type === 'file')

  return (
    <div className="mt-4 space-y-3">
      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-border-default/60"
            >
              <img src={img.url} alt={img.title ?? 'Attachment'} className="w-full max-h-80 object-cover" />
            </a>
          ))}
        </div>
      )}
      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent-secondary hover:underline"
              >
                <span className="uppercase text-[10px] font-bold tracking-wide text-text-muted">{link.type}</span>
                {link.title ?? link.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ForumCoverImage({ url, title }: { url?: string; title: string }) {
  if (!url) return null
  return (
    <img src={url} alt={title} className="w-full max-h-[420px] object-cover" />
  )
}

export function ForumTags({ tags, onSelect }: { tags: string[]; onSelect?: (tag: string) => void }) {
  if (tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect?.(tag)}
          className={cn(
            'rounded-full border border-border-default/70 bg-bg-elevated/50 px-2.5 py-0.5 text-xs text-text-muted',
            onSelect && 'hover:border-accent-secondary/40 hover:text-accent-secondary cursor-pointer',
          )}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

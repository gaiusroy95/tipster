import { cn } from '@/shared/utils/cn'

export function AdminHeaderPageTitle({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <h1
      className={cn(
        'admin-header-page-title truncate font-display text-[1.875rem] font-bold leading-none tracking-[-0.04em] sm:text-[2rem]',
        className,
      )}
    >
      <span className="admin-header-page-title-text">{title}</span>
    </h1>
  )
}

import { cn } from '@/shared/utils/cn'

interface ProfileBalanceIconProps {
  src: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}

export function ProfileBalanceIcon({ src, className, size = 'md', alt = '' }: ProfileBalanceIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'object-contain shrink-0 select-none',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-16 w-16',
        className,
      )}
      draggable={false}
    />
  )
}

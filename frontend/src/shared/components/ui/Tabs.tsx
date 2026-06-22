import { type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface TabsProps {
  tabs: { id: string; label: string; shortLabel?: string }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  scrollable?: boolean
}

export function Tabs({ tabs, activeTab, onChange, className, scrollable = false }: TabsProps) {
  return (
    <div
      className={cn(
        scrollable
          ? 'flex gap-1 overflow-x-auto scroll-snap-x rounded-lg bg-bg-elevated p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex gap-1 rounded-lg bg-bg-elevated p-1',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            scrollable ? 'shrink-0 scroll-snap-item' : 'flex-1',
            'rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[44px]',
            activeTab === tab.id
              ? 'bg-bg-surface text-text-primary shadow-card'
              : 'text-text-muted hover:text-text-primary',
          )}
        >
          <span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  children: ReactNode
  active: boolean
}

export function TabPanel({ children, active }: TabPanelProps) {
  if (!active) return null
  return <div role="tabpanel">{children}</div>
}

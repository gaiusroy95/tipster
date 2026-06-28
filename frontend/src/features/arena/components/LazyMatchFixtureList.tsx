import { useEffect, useRef, useState } from 'react'
import { MatchFixtureCard } from '@/features/arena/components/MatchFixtureCard'
import type { MatchWithTeams } from '@/features/fixtures/hooks/useFixtures'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const INITIAL_BATCH = 4
const BATCH_SIZE = 6

interface LazyMatchFixtureListProps {
  matches: MatchWithTeams[]
  showFeatured?: boolean
}

export function LazyMatchFixtureList({ matches, showFeatured = false }: LazyMatchFixtureListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const listKey = matches.map((m) => m.id).join('|')

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH)
  }, [listKey])

  useEffect(() => {
    if (visibleCount >= matches.length) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + BATCH_SIZE, matches.length))
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [matches.length, visibleCount])

  const visibleMatches = matches.slice(0, visibleCount)
  const hasMore = visibleCount < matches.length

  return (
    <div className="space-y-3 p-2">
      {visibleMatches.map((match, index) => (
        <MatchFixtureCard
          key={match.id}
          match={match}
          featured={showFeatured && index === 0}
        />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="space-y-3 pt-1" aria-hidden="true">
          <Skeleton className="h-[180px] w-full rounded-lg opacity-60" />
          <Skeleton className="h-[160px] w-full rounded-lg opacity-40" />
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { SeasonDetailPanel } from '@/features/seasons/components/SeasonDetailPanel'
import { SeasonListPanel } from '@/features/seasons/components/SeasonListPanel'
import { SeasonsPageHeader } from '@/features/seasons/components/SeasonsPageHeader'
import {
  filterSeasons,
  sortSeasons,
  summarizeSeasons,
  type Season,
} from '@/features/seasons/lib/seasonUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { AdminPageShell } from '@/shared/components/AdminPageShell'
import { cn } from '@/shared/utils/cn'

export function SeasonsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [deletingPrizeId, setDeletingPrizeId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seasons(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Season[]>>('/seasons')
      return res.data.data
    },
  })

  const seasons = data ?? []
  const summary = summarizeSeasons(seasons)

  const visibleSeasons = useMemo(() => {
    const filtered = filterSeasons(seasons, filter, search)
    return sortSeasons(filtered)
  }, [seasons, filter, search])

  const selected = seasons.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    if (createMode) return
    if (seasons.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !seasons.some((s) => s.id === selectedId)) {
      const active = seasons.find((s) => s.isActive)
      setSelectedId(active?.id ?? seasons[0].id)
    }
  }, [seasons, selectedId, createMode])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.seasons() })

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string
      description: string
      startDate: string
      endDate: string
    }) => {
      const res = await adminClient.post<ApiResponse<Season>>('/seasons', {
        ...payload,
        status: 'upcoming',
      })
      return res.data.data
    },
    onSuccess: (created) => {
      invalidate()
      setCreateMode(false)
      setSelectedId(created.id)
      setMobileDetailOpen(true)
    },
  })

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      setActivatingId(id)
      await adminClient.post(`/seasons/${id}/activate`)
    },
    onSettled: () => setActivatingId(null),
    onSuccess: invalidate,
  })

  const addPrizeMutation = useMutation({
    mutationFn: async ({
      seasonId,
      data,
    }: {
      seasonId: string
      data: { rankFrom: number; rankTo: number; name: string; description: string }
    }) => {
      await adminClient.post(`/seasons/${seasonId}/prizes`, data)
    },
    onSuccess: invalidate,
  })

  const deletePrizeMutation = useMutation({
    mutationFn: async (prizeId: string) => {
      setDeletingPrizeId(prizeId)
      await adminClient.delete(`/seasons/prizes/${prizeId}`)
    },
    onSettled: () => setDeletingPrizeId(null),
    onSuccess: invalidate,
  })

  const handleSelect = (id: string) => {
    setCreateMode(false)
    setSelectedId(id)
    setMobileDetailOpen(true)
  }

  const handleCreateClick = () => {
    setCreateMode(true)
    setMobileDetailOpen(true)
  }

  return (
    <AdminPageShell>
      {isLoading && !data ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (
        <SeasonsPageHeader
          total={summary.total}
          prizeTiers={summary.prizeTiers}
          upcoming={summary.upcoming}
          activeName={summary.active?.name ?? null}
          activeDates={
            summary.active
              ? { start: summary.active.startDate, end: summary.active.endDate }
              : null
          }
          progress={summary.progress}
          daysLeft={summary.daysLeft}
          onCreateClick={handleCreateClick}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div
          className={cn(
            'lg:col-span-5',
            mobileDetailOpen ? 'hidden lg:block' : 'block',
          )}
        >
          <SeasonListPanel
            seasons={visibleSeasons}
            matchCount={visibleSeasons.length}
            totalCount={summary.total}
            isLoading={isLoading}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            selectedId={createMode ? null : selectedId}
            onSelect={handleSelect}
          />
        </div>

        <div
          className={cn(
            'lg:col-span-7',
            mobileDetailOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <SeasonDetailPanel
            season={selected}
            mode={createMode ? 'create' : 'view'}
            showBack
            onBack={() => {
              setMobileDetailOpen(false)
              setCreateMode(false)
            }}
            onCancelCreate={() => setCreateMode(false)}
            onCreate={(payload) => createMutation.mutate(payload)}
            isCreating={createMutation.isPending}
            onActivate={(id) => activateMutation.mutate(id)}
            isActivating={activateMutation.isPending}
            activatingId={activatingId}
            onAddPrize={(seasonId, prize) =>
              addPrizeMutation.mutate({ seasonId, data: prize })
            }
            isAddingPrize={addPrizeMutation.isPending}
            onDeletePrize={(prizeId) => deletePrizeMutation.mutate(prizeId)}
            deletingPrizeId={deletingPrizeId}
          />
        </div>
      </div>
    </AdminPageShell>
  )
}

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { ArenaMarketsGrid } from '@/features/markets/components/ArenaMarketsGrid'
import { MarketsPageHeader } from '@/features/markets/components/MarketsPageHeader'
import { OvertimeCatalogPanel } from '@/features/markets/components/OvertimeCatalogPanel'
import {
  summarizeCatalog,
  type ArenaMarketCategory,
  type MarketTypeConfig,
  type OvertimeMarketTypeRow,
} from '@/features/markets/lib/marketUtils'
import { AdminPageShell } from '@/shared/components/AdminPageShell'
import { Skeleton } from '@/shared/components/ui/Card'

export function MarketsPage() {
  const queryClient = useQueryClient()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ArenaMarketCategory>('all')

  const { data: arenaMarkets, isLoading: arenaLoading } = useQuery({
    queryKey: queryKeys.marketTypes(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<MarketTypeConfig[]>>('/market-types')
      return res.data.data ?? []
    },
  })

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: queryKeys.marketTypesCatalog(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<OvertimeMarketTypeRow[]>>(
        '/market-types/overtime-catalog',
      )
      return res.data.data ?? []
    },
  })

  const markets = arenaMarkets ?? []
  const overtimeCatalog = catalog ?? []
  const enabledCount = markets.filter((row) => row.isEnabled).length
  const catalogSummary = useMemo(() => summarizeCatalog(overtimeCatalog), [overtimeCatalog])

  const sortedArenaMarkets = useMemo(
    () => [...markets].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [markets],
  )

  const syncMutation = useMutation({
    mutationFn: async () => {
      await adminClient.post('/market-types/sync')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.marketTypes() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.marketTypesCatalog() })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      setTogglingId(id)
      await adminClient.patch(`/market-types/${id}`, { isEnabled })
    },
    onSettled: () => setTogglingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.marketTypes() }),
  })

  const pageLoading = arenaLoading && !arenaMarkets

  return (
    <AdminPageShell className="space-y-6">
      {pageLoading ? (
        <Skeleton className="h-56 rounded-3xl" />
      ) : (
        <MarketsPageHeader
          arenaTotal={markets.length}
          enabled={enabledCount}
          disabled={markets.length - enabledCount}
          overtimeTotal={catalogSummary.total}
          extendedCount={catalogSummary.extended}
          onSync={() => syncMutation.mutate()}
          isSyncing={syncMutation.isPending}
        />
      )}

      <ArenaMarketsGrid
        markets={sortedArenaMarkets}
        isLoading={arenaLoading}
        togglingId={togglingId}
        onToggle={(market, isEnabled) => toggleMutation.mutate({ id: market.id, isEnabled })}
      />

      <OvertimeCatalogPanel
        catalog={overtimeCatalog}
        isLoading={catalogLoading}
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
      />
    </AdminPageShell>
  )
}

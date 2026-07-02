import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { AuditDossierPanel } from '@/features/audit/components/AuditDossierPanel'
import { AuditFilterRail } from '@/features/audit/components/AuditFilterRail'
import { AuditTimelineStream } from '@/features/audit/components/AuditTimelineStream'
import { AuditVaultHero } from '@/features/audit/components/AuditVaultHero'
import {
  auditApiEntityType,
  filterAuditEntries,
  summarizeAuditEntries,
  type AdminAuditEntry,
  type AuditEntityFilter,
} from '@/features/audit/lib/auditUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { AdminPageShell } from '@/shared/components/AdminPageShell'

const PAGE_SIZE = 30

export function AuditLogPage() {
  const dossierRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<AuditEntityFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadedEntries, setLoadedEntries] = useState<AdminAuditEntry[]>([])

  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: queryKeys.audit({ entityType, page }),
    queryFn: async () => {
      const params: Record<string, string | number> = {
        limit: PAGE_SIZE,
        page,
      }
      const apiEntityType = auditApiEntityType(entityType)
      if (apiEntityType) params.entityType = apiEntityType

      const res = await adminClient.get<ApiResponse<Paginated<AdminAuditEntry>>>('/audit-logs', {
        params,
      })
      return res.data.data
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (isPending) {
      if (page === 1) setLoadedEntries([])
      return
    }

    if (!data) {
      if (page === 1) setLoadedEntries([])
      return
    }

    setLoadedEntries((prev) => {
      if (page === 1) return data.items
      const ids = new Set(prev.map((entry) => entry.id))
      const next = data.items.filter((entry) => !ids.has(entry.id))
      return [...prev, ...next]
    })
  }, [data, page, entityType, isPending])

  const handleEntityTypeChange = (value: AuditEntityFilter) => {
    if (value === entityType) return
    setEntityType(value)
    setPage(1)
    setSelectedId(null)
  }

  const visibleEntries = useMemo(
    () => filterAuditEntries(loadedEntries, search),
    [loadedEntries, search],
  )

  useEffect(() => {
    if (!selectedId) return
    const stillVisible = visibleEntries.some((entry) => entry.id === selectedId)
    if (!stillVisible && visibleEntries.length > 0) {
      setSelectedId(visibleEntries[0]?.id ?? null)
    }
  }, [visibleEntries, selectedId])

  const total = data?.total ?? 0
  const summary = useMemo(
    () => summarizeAuditEntries(visibleEntries, search ? visibleEntries.length : total),
    [visibleEntries, search, total],
  )
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId) ?? null
  const hasMore = !search && loadedEntries.length < total
  const timelineLoading = isPending || (isFetching && page === 1 && loadedEntries.length === 0)

  const handleSelect = (entry: AdminAuditEntry) => {
    setSelectedId(entry.id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => {
        dossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <AdminPageShell compact>
      {timelineLoading && loadedEntries.length === 0 ? (
        <Skeleton className="h-64 rounded-[1.75rem]" />
      ) : (
        <AuditVaultHero
          total={summary.total}
          loaded={summary.loaded}
          recent24h={summary.recent24h}
          admins={summary.admins}
          critical={summary.critical}
        />
      )}

      <AuditFilterRail
        search={search}
        onSearchChange={setSearch}
        entityType={entityType}
        onEntityTypeChange={handleEntityTypeChange}
        total={total}
        visible={visibleEntries.length}
      />

      <div className="grid gap-5 lg:grid-cols-12 lg:items-start lg:gap-6 xl:gap-8">
        <div className="lg:col-span-5 xl:col-span-5 lg:min-h-0">
          <AuditTimelineStream
            entries={visibleEntries}
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoading={timelineLoading}
            hasMore={hasMore}
            onLoadMore={() => setPage((current) => current + 1)}
            isLoadingMore={isFetching && page > 1}
            isError={isError}
            activeFilter={entityType}
            totalRecords={search ? visibleEntries.length : total}
          />
        </div>

        <div ref={dossierRef} className="lg:col-span-7 xl:col-span-7">
          <AuditDossierPanel entry={selectedEntry} />
        </div>
      </div>
    </AdminPageShell>
  )
}

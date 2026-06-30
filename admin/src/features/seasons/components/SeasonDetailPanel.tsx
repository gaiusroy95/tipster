import { useState } from 'react'
import {
  ArrowLeftIcon,
  BoltIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import {
  defaultSeasonDates,
  formatRankRange,
  formatSeasonDates,
  getPrizeTierAccent,
  getSeasonDaysLeft,
  getSeasonProgress,
  getStatusBadge,
  type Season,
  type SeasonPrize,
} from '@/features/seasons/lib/seasonUtils'
import { SeasonProgressRing } from '@/features/seasons/components/SeasonProgressRing'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { cn } from '@/shared/utils/cn'

function PrizeTierCard({
  prize,
  onDelete,
  isDeleting,
}: {
  prize: SeasonPrize
  onDelete: () => void
  isDeleting: boolean
}) {
  const accent = getPrizeTierAccent(prize.rankFrom)

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 transition-colors',
        accent.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant={accent.badge}>{formatRankRange(prize.rankFrom, prize.rankTo)}</Badge>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {accent.label}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg border border-transparent p-2 text-text-muted opacity-0 transition-all hover:border-accent-loss/30 hover:bg-accent-loss/10 hover:text-accent-loss group-hover:opacity-100 disabled:opacity-50"
          aria-label={`Delete ${prize.name}`}
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <h3 className="mt-3 font-display text-base font-bold">{prize.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">{prize.description}</p>
    </article>
  )
}

function CreateSeasonForm({
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  onSubmit: (data: {
    name: string
    description: string
    startDate: string
    endDate: string
  }) => void
  isSubmitting: boolean
  onCancel: () => void
}) {
  const defaults = defaultSeasonDates()
  const [name, setName] = useState(defaults.defaultName)
  const [description, setDescription] = useState(
    'Compete across curated leagues. Climb the leaderboard and claim seasonal rewards.',
  )
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          name: name.trim() || defaults.defaultName,
          description: description.trim() || 'Tipster competition season',
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        })
      }}
    >
      <div className="rounded-2xl border border-accent-secondary/20 bg-gradient-to-br from-accent-secondary/10 to-transparent p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary">
            <SparklesIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-lg font-bold">New competition season</p>
            <p className="text-sm text-text-muted">
              Set the calendar window and launch when you&apos;re ready to go live.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="season-name">Season name</Label>
          <Input
            id="season-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Season 2025/26"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="season-description">Description</Label>
          <textarea
            id="season-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-default bg-bg-elevated px-4 py-3 text-base text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:outline-none"
          />
        </div>
        <div>
          <Label htmlFor="season-start">Start date</Label>
          <Input
            id="season-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="season-end">End date</Label>
          <Input
            id="season-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create season
        </Button>
      </div>
    </form>
  )
}

function AddPrizeForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: {
    rankFrom: number
    rankTo: number
    name: string
    description: string
  }) => void
  isSubmitting: boolean
}) {
  const [rankFrom, setRankFrom] = useState('1')
  const [rankTo, setRankTo] = useState('1')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <form
      className="rounded-2xl border border-border-default/70 bg-bg-elevated/20 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        const from = Number(rankFrom)
        const to = Number(rankTo)
        if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to < from) return
        if (!name.trim() || !description.trim()) return
        onSubmit({
          rankFrom: from,
          rankTo: to,
          name: name.trim(),
          description: description.trim(),
        })
        setName('')
        setDescription('')
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <PlusIcon className="h-4 w-4 text-accent-primary" aria-hidden="true" />
        <p className="text-sm font-semibold">Add prize tier</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="prize-from">Rank from</Label>
          <Input
            id="prize-from"
            type="number"
            min={1}
            value={rankFrom}
            onChange={(e) => setRankFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="prize-to">Rank to</Label>
          <Input
            id="prize-to"
            type="number"
            min={1}
            value={rankTo}
            onChange={(e) => setRankTo(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="prize-name">Prize name</Label>
          <Input
            id="prize-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Champion's Crown"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="prize-description">Description</Label>
          <Input
            id="prize-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exclusive seasonal reward for top performers"
          />
        </div>
      </div>
      <Button type="submit" size="sm" className="mt-4" isLoading={isSubmitting}>
        Add tier
      </Button>
    </form>
  )
}

export function SeasonDetailPanel({
  season,
  mode,
  showBack,
  onBack,
  onCancelCreate,
  onCreate,
  isCreating,
  onActivate,
  isActivating,
  activatingId,
  onAddPrize,
  isAddingPrize,
  onDeletePrize,
  deletingPrizeId,
}: {
  season: Season | null
  mode: 'view' | 'create'
  showBack?: boolean
  onBack?: () => void
  onCancelCreate: () => void
  onCreate: (data: {
    name: string
    description: string
    startDate: string
    endDate: string
  }) => void
  isCreating: boolean
  onActivate: (id: string) => void
  isActivating: boolean
  activatingId: string | null
  onAddPrize: (
    seasonId: string,
    data: { rankFrom: number; rankTo: number; name: string; description: string },
  ) => void
  isAddingPrize: boolean
  onDeletePrize: (prizeId: string) => void
  deletingPrizeId: string | null
}) {
  if (mode === 'create') {
    return (
      <PanelCard title="Create season" subtitle="Configure a new competition cycle">
        <CreateSeasonForm
          onSubmit={onCreate}
          isSubmitting={isCreating}
          onCancel={onCancelCreate}
        />
      </PanelCard>
    )
  }

  if (!season) {
    return (
      <PanelCard
        title="Season details"
        subtitle="Select a season from the timeline"
        className="flex min-h-[420px] items-center justify-center"
        bodyClassName="flex flex-1 flex-col items-center justify-center py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated/50">
          <TrophyIcon className="h-8 w-8 text-accent-primary" aria-hidden="true" />
        </div>
        <p className="mt-4 font-display text-lg font-bold">Choose a season</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
          Review prize tiers, track progress, and activate the next competition cycle from here.
        </p>
      </PanelCard>
    )
  }

  const status = getStatusBadge(season)
  const progress = season.isActive ? getSeasonProgress(season.startDate, season.endDate) : null
  const daysLeft = season.isActive ? getSeasonDaysLeft(season.endDate) : null

  return (
    <PanelCard
      title={season.name}
      subtitle={formatSeasonDates(season.startDate, season.endDate)}
      action={
        showBack ? (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        ) : null
      }
      bodyClassName="space-y-6"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5',
          season.isActive
            ? 'border-accent-win/25 bg-gradient-to-br from-accent-win/10 via-bg-primary/40 to-transparent'
            : 'border-border-default/70 bg-bg-elevated/20',
        )}
      >
        {season.isActive ? (
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-win/15 blur-3xl"
            aria-hidden="true"
          />
        ) : null}

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="text-xs text-text-muted">
                {season.prizes.length} prize tier{season.prizes.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-muted">{season.description}</p>
            {daysLeft !== null ? (
              <p className="text-sm font-semibold text-accent-primary">
                {daysLeft} day{daysLeft === 1 ? '' : 's'} until season ends
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
            {progress !== null ? (
              <SeasonProgressRing progress={progress} size="lg" icon={TrophyIcon} />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border-default/70 bg-bg-primary/40">
                <TrophyIcon className="h-10 w-10 text-text-muted" aria-hidden="true" />
              </span>
            )}
            {!season.isActive ? (
              <Button
                size="sm"
                onClick={() => onActivate(season.id)}
                isLoading={isActivating && activatingId === season.id}
              >
                <BoltIcon className="h-4 w-4" aria-hidden="true" />
                Activate season
              </Button>
            ) : null}
          </div>
        </div>

        {progress !== null ? (
          <div className="relative mt-5">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              <span>Season timeline</span>
              <span className="tabular-nums text-accent-primary">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border-default/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-win via-accent-primary to-accent-secondary transition-all duration-700"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold">Prize tiers</h3>
            <p className="text-xs text-text-muted">Rewards granted by final leaderboard rank</p>
          </div>
        </div>

        {season.prizes.length > 0 ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {season.prizes
              .slice()
              .sort((a, b) => a.rankFrom - b.rankFrom)
              .map((prize, index) => (
                <PrizeTierCard
                  key={prize.id || `${season.id}-prize-${prize.rankFrom}-${prize.rankTo}-${index}`}
                  prize={prize}
                  onDelete={() => onDeletePrize(prize.id)}
                  isDeleting={deletingPrizeId === prize.id}
                />
              ))}
          </div>
        ) : (
          <div className="mb-4 rounded-2xl border border-dashed border-border-default/80 px-4 py-8 text-center">
            <SparklesIcon className="mx-auto h-6 w-6 text-text-muted" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold">No prizes configured</p>
            <p className="mt-1 text-xs text-text-muted">
              Add tiers so players know what they&apos;re competing for.
            </p>
          </div>
        )}

        <AddPrizeForm
          onSubmit={(data) => onAddPrize(season.id, data)}
          isSubmitting={isAddingPrize}
        />
      </div>
    </PanelCard>
  )
}

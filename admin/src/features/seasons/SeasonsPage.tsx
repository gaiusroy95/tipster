import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, Skeleton } from '@/shared/components/ui/Card'

interface Season {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  isActive: boolean
  prizes: Array<{
    id: string
    rankFrom: number
    rankTo: number
    name: string
    description: string
  }>
}

export function SeasonsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.seasons(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Season[]>>('/seasons')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const now = new Date()
      const end = new Date(now)
      end.setFullYear(end.getFullYear() + 1)
      await adminClient.post('/seasons', {
        name: name || `Season ${now.getFullYear()}/${String(now.getFullYear() + 1).slice(-2)}`,
        description: description || 'Tipster competition season',
        startDate: now.toISOString(),
        endDate: end.toISOString(),
        status: 'upcoming',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasons() })
      setName('')
      setDescription('')
    },
  })

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminClient.post(`/seasons/${id}/activate`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.seasons() }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seasons</h1>

      <Card className="space-y-3">
        <h2 className="font-semibold">Create season</h2>
        <Input placeholder="Season name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>
          Create season
        </Button>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {data?.map((season) => (
            <Card key={season.id} className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {season.name}
                    {season.isActive ? (
                      <span className="ml-2 text-xs text-accent-win">Active</span>
                    ) : null}
                  </h3>
                  <p className="text-sm text-text-muted">{season.description}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(season.startDate).toLocaleDateString()} –{' '}
                    {new Date(season.endDate).toLocaleDateString()} · {season.status}
                  </p>
                </div>
                {!season.isActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => activateMutation.mutate(season.id)}
                    isLoading={activateMutation.isPending}
                  >
                    Activate
                  </Button>
                ) : null}
              </div>
              {season.prizes.length > 0 ? (
                <ul className="text-sm text-text-muted">
                  {season.prizes.map((prize) => (
                    <li key={prize.id}>
                      Ranks {prize.rankFrom}–{prize.rankTo}: {prize.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

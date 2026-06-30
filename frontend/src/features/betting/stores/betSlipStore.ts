import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MarketType } from '@/core/constants/markets'
import { bettingRules } from '@/core/config/bettingRules'

export interface BetSelection {
  matchId: string
  homeTeam: string
  awayTeam: string
  marketType: MarketType
  selectionId: string
  selectionLabel: string
  odds: number
  stake?: number
}

export function resolveSelectionStake(
  selection: Pick<BetSelection, 'stake'>,
  fallback = bettingRules.standardStake,
): number {
  return selection.stake ?? fallback
}

interface BetSlipState {
  selections: BetSelection[]
  defaultStake: number
  isPanelOpen: boolean
  addSelection: (selection: Omit<BetSelection, 'stake'> & { stake?: number }) => void
  removeSelection: (matchId: string) => void
  clearSelections: () => void
  setSelectionStake: (matchId: string, stake: number) => void
  updateSelectionOdds: (matchId: string, odds: number) => void
  setDefaultStake: (stake: number) => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  clear: () => void
}

type PersistedBetSlip = {
  selections?: BetSelection[]
  stake?: number
  defaultStake?: number
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set) => ({
      selections: [],
      defaultStake: bettingRules.standardStake,
      isPanelOpen: false,

      addSelection: (selection) =>
        set((state) => {
          const existing = state.selections.find((s) => s.matchId === selection.matchId)
          const stake = selection.stake ?? existing?.stake ?? state.defaultStake
          return {
            selections: [
              ...state.selections.filter((s) => s.matchId !== selection.matchId),
              { ...selection, stake },
            ],
          }
        }),

      removeSelection: (matchId) =>
        set((state) => ({
          selections: state.selections.filter((s) => s.matchId !== matchId),
        })),

      clearSelections: () => set({ selections: [] }),

      setSelectionStake: (matchId, stake) =>
        set((state) => ({
          selections: state.selections.map((s) =>
            s.matchId === matchId ? { ...s, stake } : s,
          ),
        })),

      updateSelectionOdds: (matchId, odds) =>
        set((state) => ({
          selections: state.selections.map((s) =>
            s.matchId === matchId ? { ...s, odds } : s,
          ),
        })),

      setDefaultStake: (defaultStake) => set({ defaultStake }),

      setPanelOpen: (isPanelOpen) => set({ isPanelOpen }),

      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

      clear: () =>
        set({
          selections: [],
          defaultStake: bettingRules.standardStake,
          isPanelOpen: false,
        }),
    }),
    {
      name: 'bet-slip-store',
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          return {
            selections: [],
            defaultStake: bettingRules.standardStake,
          }
        }
        const state = persisted as PersistedBetSlip
        const defaultStake =
          state.defaultStake ?? state.stake ?? bettingRules.standardStake
        const selections = (state.selections ?? []).map((sel) => ({
          ...sel,
          stake: sel.stake ?? defaultStake,
        }))
        return { selections, defaultStake }
      },
      partialize: (state) => ({
        selections: state.selections,
        defaultStake: state.defaultStake,
      }),
    },
  ),
)

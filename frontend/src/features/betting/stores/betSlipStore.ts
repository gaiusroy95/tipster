import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MarketType } from '@/core/constants/markets'

export interface BetSelection {
  matchId: string
  homeTeam: string
  awayTeam: string
  marketType: MarketType
  selectionId: string
  selectionLabel: string
  odds: number
}

interface BetSlipState {
  selections: BetSelection[]
  stake: number
  isPanelOpen: boolean
  addSelection: (selection: BetSelection) => void
  removeSelection: (matchId: string) => void
  clearSelections: () => void
  setStake: (stake: number) => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  clear: () => void
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set) => ({
      selections: [],
      stake: 25000,
      isPanelOpen: false,

      addSelection: (selection) =>
        set((state) => ({
          selections: [
            ...state.selections.filter((s) => s.matchId !== selection.matchId),
            selection,
          ],
        })),

      removeSelection: (matchId) =>
        set((state) => ({
          selections: state.selections.filter((s) => s.matchId !== matchId),
        })),

      clearSelections: () => set({ selections: [] }),

      setStake: (stake) => set({ stake }),

      setPanelOpen: (isPanelOpen) => set({ isPanelOpen }),

      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

      clear: () => set({ selections: [], stake: 25000, isPanelOpen: false }),
    }),
    { name: 'bet-slip-store', partialize: (state) => ({
      selections: state.selections,
      stake: state.stake,
    }) },
  ),
)

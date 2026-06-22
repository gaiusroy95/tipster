import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  betSlipOpen: boolean
  setSidebarCollapsed: (v: boolean) => void
  setBetSlipOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  betSlipOpen: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setBetSlipOpen: (v) => set({ betSlipOpen: v }),
}))

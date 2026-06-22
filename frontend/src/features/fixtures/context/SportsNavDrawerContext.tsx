import { createContext, useContext, type ReactNode } from 'react'

interface SportsNavDrawerContextValue {
  open: () => void
  close: () => void
}

const SportsNavDrawerContext = createContext<SportsNavDrawerContextValue | null>(null)

export function SportsNavDrawerProvider({
  open,
  close,
  children,
}: SportsNavDrawerContextValue & { children: ReactNode }) {
  return (
    <SportsNavDrawerContext.Provider value={{ open, close }}>
      {children}
    </SportsNavDrawerContext.Provider>
  )
}

export function useSportsNavDrawer() {
  const ctx = useContext(SportsNavDrawerContext)
  if (!ctx) {
    throw new Error('useSportsNavDrawer must be used within SportsNavDrawerProvider')
  }
  return ctx
}

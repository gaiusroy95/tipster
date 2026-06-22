import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface EditProfileDrawerContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const EditProfileDrawerContext = createContext<EditProfileDrawerContextValue | null>(null)

export function EditProfileDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])

  return (
    <EditProfileDrawerContext.Provider value={value}>
      {children}
    </EditProfileDrawerContext.Provider>
  )
}

export function useEditProfileDrawer() {
  const ctx = useContext(EditProfileDrawerContext)
  if (!ctx) {
    throw new Error('useEditProfileDrawer must be used within EditProfileDrawerProvider')
  }
  return ctx
}

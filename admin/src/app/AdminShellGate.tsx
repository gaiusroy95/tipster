import { useEffect, useState, type ReactNode } from 'react'
import { beginAdminShellReady } from '@/app/queryClient'
import { AppSplashScreen } from '@/shared/components/AppSplashScreen'

export function AdminShellGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [splashMounted, setSplashMounted] = useState(true)

  useEffect(() => {
    let cancelled = false

    beginAdminShellReady().finally(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {ready && children}
      {splashMounted && (
        <AppSplashScreen exiting={ready} onExited={() => setSplashMounted(false)} />
      )}
    </>
  )
}

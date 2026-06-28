import { AppSplashScreen } from '@/shared/components/AppSplashScreen'

/** Full-screen logo splash used during auth bootstrap. */
export function LoadingScreen() {
  return <AppSplashScreen exiting={false} onExited={() => undefined} />
}

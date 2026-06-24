/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type LazyExoticComponent, type JSX } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { MinimalLayout } from '@/shared/layouts/MinimalLayout'
import { ProtectedRoute, GuestRoute } from '@/app/guards'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const PageLoader = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
  </div>
)

const withSuspense = (Component: LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

const OAuthCallbackPage = lazy(() => import('@/features/auth/pages/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))
const RegisterPendingPage = lazy(() => import('@/features/auth/pages/RegisterPendingPage').then((m) => ({ default: m.RegisterPendingPage })))
import { TipsterHubPage } from '@/features/arena/pages/TipsterHubPage'
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage').then((m) => ({ default: m.WalletPage })))
const MatchDetailPage = lazy(() => import('@/features/fixtures/pages/MatchDetailPage').then((m) => ({ default: m.MatchDetailPage })))
const BetSlipPage = lazy(() => import('@/features/betting/pages/BetSlipPage').then((m) => ({ default: m.BetSlipPage })))
const ActiveBetsPage = lazy(() => import('@/features/bets/pages/ActiveBetsPage').then((m) => ({ default: m.ActiveBetsPage })))
const BetHistoryPage = lazy(() => import('@/features/bets/pages/BetHistoryPage').then((m) => ({ default: m.BetHistoryPage })))
const LeaderboardPage = lazy(() => import('@/features/leaderboard/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })))
const PublicProfilePage = lazy(() =>
  import('@/features/profile/pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })),
)
const SeasonsPage = lazy(() => import('@/features/seasons/pages/SeasonsPage').then((m) => ({ default: m.SeasonsPage })))
const SeasonDetailPage = lazy(() => import('@/features/seasons/pages/SeasonDetailPage').then((m) => ({ default: m.SeasonDetailPage })))
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const ProfileEditPage = lazy(() => import('@/features/settings/pages/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage })))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const TermsPage = lazy(() => import('@/features/settings/pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('@/features/legal/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const RulesPage = lazy(() => import('@/features/legal/pages/RulesPage').then((m) => ({ default: m.RulesPage })))
const AboutPage = lazy(() => import('@/features/legal/pages/LegalPages').then((m) => ({ default: m.AboutPage })))
const HelpPage = lazy(() => import('@/features/legal/pages/LegalPages').then((m) => ({ default: m.HelpPage })))
const ForumPage = lazy(() => import('@/features/forum/pages/ForumPage').then((m) => ({ default: m.ForumPage })))
const ForumPostPage = lazy(() => import('@/features/forum/pages/ForumPostPage').then((m) => ({ default: m.ForumPostPage })))
const NotFoundPage = lazy(() => import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.OAUTH_CALLBACK, element: withSuspense(OAuthCallbackPage) },
      { path: ROUTES.VERIFY_EMAIL, element: withSuspense(VerifyEmailPage) },
    ],
  },
  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { path: ROUTES.LOGIN, element: withSuspense(LoginPage) },
      { path: ROUTES.REGISTER, element: withSuspense(RegisterPage) },
      { path: ROUTES.REGISTER_PENDING, element: withSuspense(RegisterPendingPage) },
      { path: ROUTES.FORGOT_PASSWORD, element: withSuspense(ForgotPasswordPage) },
      { path: ROUTES.RESET_PASSWORD, element: withSuspense(ResetPasswordPage) },
    ],
  },
  {
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    children: [
      { path: ROUTES.HOME, element: <TipsterHubPage /> },
      { path: ROUTES.FIXTURES, element: <Navigate to={`${ROUTES.HOME}?tab=cup`} replace /> },
      { path: ROUTES.MATCH, element: withSuspense(MatchDetailPage) },
      { path: ROUTES.LEADERBOARD, element: withSuspense(LeaderboardPage) },
      { path: ROUTES.FORUM, element: withSuspense(ForumPage) },
      { path: ROUTES.FORUM_POST, element: withSuspense(ForumPostPage) },
      { path: ROUTES.PLAYER, element: withSuspense(PublicProfilePage) },
      { path: ROUTES.SEASONS, element: withSuspense(SeasonsPage) },
      { path: ROUTES.SEASON, element: withSuspense(SeasonDetailPage) },
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: ROUTES.WALLET, element: withSuspense(WalletPage) },
          { path: ROUTES.BET_SLIP, element: withSuspense(BetSlipPage) },
          { path: ROUTES.BETS_ACTIVE, element: withSuspense(ActiveBetsPage) },
          { path: ROUTES.BETS_HISTORY, element: withSuspense(BetHistoryPage) },
          { path: ROUTES.NOTIFICATIONS, element: withSuspense(NotificationsPage) },
          { path: ROUTES.PROFILE_EDIT, element: withSuspense(ProfileEditPage) },
          { path: ROUTES.SETTINGS, element: withSuspense(SettingsPage) },
        ],
      },
    ],
  },
  {
    element: <MinimalLayout />,
    children: [
      { path: ROUTES.TERMS, element: withSuspense(TermsPage) },
      { path: ROUTES.PRIVACY, element: withSuspense(PrivacyPage) },
      { path: ROUTES.RULES, element: withSuspense(RulesPage) },
      { path: ROUTES.ABOUT, element: withSuspense(AboutPage) },
      { path: ROUTES.HELP, element: withSuspense(HelpPage) },
    ],
  },
  { path: '*', element: withSuspense(NotFoundPage) },
  { path: '/dashboard', element: <Navigate to={ROUTES.HOME} replace /> },
])

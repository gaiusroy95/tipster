import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/core/api/client'
import { beginAdminShellReady } from '@/app/queryClient'
import type { AdminUser, ApiResponse } from '@/core/types/api'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader'
import { Button } from '@/shared/components/ui/Button'
import { CardContent } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { FieldError, Label } from '@/shared/components/ui/Label'

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await apiClient.post<
        ApiResponse<{ user: AdminUser; token: string } | { requiresTwoFactor: true }>
      >('/auth/login', { email, password })
      const payload = res.data.data
      if ('requiresTwoFactor' in payload && payload.requiresTwoFactor) {
        setError(
          'Two-factor authentication is required. Disable 2FA on the admin account or use the env bootstrap admin.',
        )
        return
      }
      if (!('token' in payload)) {
        setError('Unexpected login response')
        return
      }
      if (payload.user.role !== 'ADMIN') {
        setError('This account is not an administrator.')
        return
      }
      setAuth(payload.user, payload.token)
      void beginAdminShellReady()
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Admin sign in"
        subtitle="Secure access to platform controls"
      />
      <CardContent className="px-6 pb-6">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-border-default/70 bg-bg-elevated/50 px-4 py-3">
          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-secondary" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-text-muted">
            Restricted area. All actions are logged for audit and compliance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              error={!!error}
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              error={!!error}
            />
          </div>
          <FieldError message={error} />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign in
          </Button>
        </form>
      </CardContent>
    </AuthCard>
  )
}

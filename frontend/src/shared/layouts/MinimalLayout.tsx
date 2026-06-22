import { Outlet } from 'react-router-dom'

export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="px-4 py-8 max-w-3xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

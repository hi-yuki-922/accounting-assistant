import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout.tsx'

export const Route = createFileRoute('/categories')({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

/**
 * 账本路由布局
 * 提供账本相关页面的通用布局
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout.tsx'

export const Route = createFileRoute('/books')({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

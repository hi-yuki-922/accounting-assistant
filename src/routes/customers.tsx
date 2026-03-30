/**
 * 客户管理路由布局
 * 提供客户相关页面的通用布局
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout.tsx'

export const Route = createFileRoute('/customers')({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

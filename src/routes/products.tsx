/**
 * 商品管理路由布局
 * 提供商品相关页面的通用布局
 */

import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout.tsx'

export const Route = createFileRoute('/products')({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})

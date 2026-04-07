/**
 * 订单列表页面（索引路由）
 * 当访问 /orders 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { OrdersPage } from '@/pages/orders/orders-page'

export const Route = createFileRoute('/orders/')({
  component: OrdersPage,
})

/**
 * 订单详情页路由
 * 当访问 /orders/$orderId 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { OrderDetailPage } from '@/pages/orders/order-detail-page'

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailPage,
})

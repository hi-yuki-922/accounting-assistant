/**
 * 客户列表页面（索引路由）
 * 当访问 /customers 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { CustomersPage } from '@/pages/customers/customers-page'

export const Route = createFileRoute('/customers/')({
  component: CustomersPage,
})

/**
 * 商品列表页面（索引路由）
 * 当访问 /products 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { ProductsPage } from '@/pages/products/products-page'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

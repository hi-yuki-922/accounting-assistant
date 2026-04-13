/**
 * 订单列表卡片
 * 展示搜索/创建订单后的结果列表，行点击打开 OrderDetailDialog
 */

import { useState } from 'react'

import type { Order } from '@/api/commands/order'
import { formatCurrency } from '@/lib/formatters'
import { OrderDetailDialog } from '@/pages/orders/order-detail-dialog'

/**
 * 从工具结果中提取订单列表
 */
const extractOrders = (data: Record<string, unknown>): Order[] | null => {
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.data)) {
    return data.data as Order[]
  }
  if (data?.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>
    if (Array.isArray(d?.orders)) {
      return d.orders as Order[]
    }
  }
  return null
}

export type OrderListCardProps = {
  result: unknown
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  Sales: '销售',
  Purchase: '采购',
}

const STATUS_LABELS: Record<string, string> = {
  Pending: '待结账',
  Settled: '已结账',
  Cancelled: '已取消',
}

export const OrderListCard = ({ result }: OrderListCardProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const parsed = result as {
    success?: boolean
    message?: string
    data?: { orders?: Order[] } | Order[]
  }

  // 提取订单列表
  const orders = extractOrders(parsed)
  const message = parsed?.message

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border p-3">
        <p className="text-sm text-muted-foreground">
          {message ?? '未找到订单'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        {message && (
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">
            {message}
          </div>
        )}
        <div className="divide-y">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              className="flex w-full items-center gap-3 overflow-hidden px-3 py-2 text-left hover:bg-muted/50"
              onClick={() => setSelectedOrderId(order.id)}
            >
              <span className="font-mono text-xs text-muted-foreground">
                #{order.orderNo}
              </span>
              <span className="text-sm">
                {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
              </span>
              <span className="ml-auto text-sm font-medium">
                {formatCurrency(order.totalAmount)}
              </span>
              <span className="text-xs text-muted-foreground">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      <OrderDetailDialog
        open={selectedOrderId !== null}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onRefresh={() => setSelectedOrderId(null)}
      />
    </>
  )
}

/**
 * 订单详情卡片
 * 展示 get_order_detail 的结果摘要，点击打开 OrderDetailDialog
 */

import { useState } from 'react'

import type { OrderDetail as OrderDetailType } from '@/api/commands/order'
import { formatCurrency } from '@/lib/formatters'
import { OrderDetailDialog } from '@/pages/orders/order-detail-dialog'

export type OrderDetailCardProps = {
  result: unknown
}

export const OrderDetailCard = ({ result }: OrderDetailCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const parsed = result as {
    success?: boolean
    message?: string
    data?: OrderDetailType
  }

  const detail = parsed?.data
  const order = detail?.order

  if (!order) {
    return (
      <div className="rounded-lg border p-3">
        <p className="text-sm text-muted-foreground">未找到订单详情</p>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="w-full rounded-lg border p-3 text-left hover:bg-muted/50"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            #{order.orderNo}
          </span>
          <span className="text-xs text-muted-foreground">{order.status}</span>
        </div>
        <div className="mt-1 text-sm font-medium">
          {formatCurrency(order.totalAmount)}
        </div>
        {detail?.items && detail.items.length > 0 && (
          <p className="mt-1 break-words text-xs text-muted-foreground">
            {detail.items.map((i) => i.productName).join('、')}
          </p>
        )}
        <p className="mt-1 text-xs text-primary">点击查看详情</p>
      </button>

      <OrderDetailDialog
        open={dialogOpen}
        orderId={order.id}
        onClose={() => setDialogOpen(false)}
        onRefresh={() => setDialogOpen(false)}
      />
    </>
  )
}

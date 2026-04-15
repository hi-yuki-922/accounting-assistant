/**
 * 订单看板卡片组件
 * 展示：业务类型+客户名称、创建时间、备注、金额
 */

import type { Order } from '@/api/commands/order/type'
import {
  ORDER_SUB_TYPE_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'

export type OrderBoardCardProps = {
  order: Order
  onClick: (order: Order) => void
}

/** 获取卡片首行标签文本 */
function getCardLabel(order: Order): string {
  const subTypeText = order.subType
    ? (ORDER_SUB_TYPE_DISPLAY_TEXT[
        order.subType as keyof typeof ORDER_SUB_TYPE_DISPLAY_TEXT
      ] ?? '')
    : ORDER_TYPE_DISPLAY_TEXT[order.orderType]
  const customerName = order.customerName || '散客'
  return `${subTypeText} · ${customerName}`
}

export const OrderBoardCard: React.FC<OrderBoardCardProps> = ({
  order,
  onClick,
}) => {
  const isPurchase = order.orderType === 'Purchase'
  const amountLabel = isPurchase ? '应付' : '应收'
  const actualLabel = isPurchase ? '实付' : '实收'
  const showActual = order.status === 'Settled' || order.status === 'Cancelled'

  return (
    <button
      type="button"
      className="w-full text-left rounded-lg border border-border bg-card p-3 space-y-1.5 cursor-pointer transition-colors hover:bg-accent"
      onClick={() => {
        onClick(order)
      }}
    >
      {/* 首行：业务类型 · 客户名称 + 状态 */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">
          {getCardLabel(order)}
        </span>
        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
          {order.orderNo}
        </Badge>
      </div>

      {/* 时间 */}
      <p className="text-xs text-muted-foreground">
        {formatDate(order.createAt, 'datetime-compact')}
      </p>

      {/* 备注 */}
      {order.remark && (
        <p className="text-xs text-muted-foreground truncate">{order.remark}</p>
      )}

      {/* 金额 */}
      <div className="flex items-center gap-3 text-xs pt-1">
        <span>
          <span className="text-muted-foreground">{amountLabel}：</span>
          <span className="font-medium">
            {formatCurrency(order.totalAmount)}
          </span>
        </span>
        {showActual && (
          <span>
            <span className="text-muted-foreground">{actualLabel}：</span>
            <span className="font-medium">
              {formatCurrency(order.actualAmount)}
            </span>
          </span>
        )}
      </div>
    </button>
  )
}

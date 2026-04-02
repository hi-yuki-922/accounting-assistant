/**
 * 订单卡片组件
 * 展示订单编号、类型、客户、金额、状态、操作按钮
 */

import { useNavigate } from '@tanstack/react-router'

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import type { Order } from '@/api/commands/order/type'
import {
  ORDER_STATUS_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type OrderCardProps = {
  order: Order
  onRefresh: () => void
  onSettle: (order: Order) => void
  onCancel: (order: Order) => void
}

/** 格式化金额显示 */
const formatAmount = (amount: number) => `¥${amount.toFixed(2)}`

/** 格式化时间显示 */
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 订单状态对应的 Badge 变体 */
const STATUS_BADGE_MAP = {
  Pending: 'outline' as const,
  Settled: 'default' as const,
  Cancelled: 'secondary' as const,
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onRefresh,
  onSettle,
  onCancel,
}) => {
  const navigate = useNavigate()

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div
          className="flex items-start justify-between gap-2"
          onClick={() =>
            navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
          }
        >
          <div className="flex-1 min-w-0">
            {/* 订单编号 + 类型 + 状态 */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {order.orderNo}
              </h3>
              <Badge variant="secondary">
                {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
              </Badge>
              <Badge variant={STATUS_BADGE_MAP[order.status]}>
                {ORDER_STATUS_DISPLAY_TEXT[order.status]}
              </Badge>
            </div>

            {/* 渠道 + 时间 */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>
                {ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                  order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                ] ?? order.channel}
              </span>
              <span>{formatTime(order.createAt)}</span>
            </div>

            {/* 金额 */}
            <div className="flex gap-4 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">应收：</span>
                <span className="font-medium text-foreground">
                  {formatAmount(order.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">实收：</span>
                <span className="font-medium text-foreground">
                  {formatAmount(order.actualAmount)}
                </span>
              </div>
            </div>

            {/* 备注 */}
            {order.remark && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                {order.remark}
              </p>
            )}
          </div>

          {/* 操作按钮 - 仅待结账状态显示 */}
          {order.status === 'Pending' && (
            <div
              className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" onClick={() => onSettle(order)}>
                结账
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(order)}
                className="text-destructive"
              >
                取消
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

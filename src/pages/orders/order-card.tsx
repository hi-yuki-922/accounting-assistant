/**
 * 订单卡片组件
 * 展示订单编号、类型、客户、金额、状态
 * 点击卡片弹出详情 Dialog
 */

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import type { Order } from '@/api/commands/order/type'
import {
  ORDER_STATUS_DISPLAY_TEXT,
  ORDER_TYPE_DISPLAY_TEXT,
} from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export type OrderCardProps = {
  order: Order
  onClick: (order: Order) => void
}

/** 格式化金额显示 */
const formatAmount = (amount: number | string) =>
  `¥${Number(amount).toFixed(2)}`

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

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => (
  <Card
    className="group hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onClick(order)}
  >
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2">
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
            {order.channel !== 'Unknown' && (
              <span>
                {ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                  order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                ] ?? order.channel}
              </span>
            )}
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
      </div>
    </CardContent>
  </Card>
)

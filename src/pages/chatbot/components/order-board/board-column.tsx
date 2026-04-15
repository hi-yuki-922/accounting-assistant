/**
 * 看板列组件
 * 列标题+订单数量+卡片列表+空状态
 */

import type { Order } from '@/api/commands/order/type'
import { ScrollArea } from '@/components/ui/scroll-area'

import { OrderBoardCard } from './order-board-card'
import type { BoardColumn } from './use-order-board'

export type BoardColumnViewProps = {
  column: BoardColumn
  onCardClick: (order: Order) => void
}

export const BoardColumnView: React.FC<BoardColumnViewProps> = ({
  column,
  onCardClick,
}) => (
  <div className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-border last:border-r-0">
    {/* 列标题 */}
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
      <span className="text-sm font-medium">{column.title}</span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {column.orders.length}
      </span>
    </div>

    {/* 卡片列表 */}
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {column.orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">暂无订单</p>
          </div>
        ) : (
          column.orders.map((order) => (
            <OrderBoardCard
              key={order.id}
              order={order}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </ScrollArea>
  </div>
)

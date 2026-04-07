/**
 * 编辑订单对话框
 * 允许修改 Pending 状态订单的明细和备注
 * 不可修改订单类型和客户
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { orderApi } from '@/api/commands/order'
import type { Order, OrderItem } from '@/api/commands/order/type'
import { ORDER_TYPE_DISPLAY_TEXT } from '@/api/commands/order/type'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  OrderItemRowEditor,
  createEmptyRow,
  fromOrderItem,
  validateItemRows,
  extractValidItems,
} from './components/order-item-row-editor'
import type { ItemRow } from './components/order-item-row-editor'

export type EditOrderDialogProps = {
  open: boolean
  order: Order
  items: OrderItem[]
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  open,
  order,
  items: initialItems,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [remark, setRemark] = useState('')
  const [itemRows, setItemRows] = useState<ItemRow[]>([])

  // 初始化
  useEffect(() => {
    if (open) {
      setRemark(order.remark ?? '')
      setItemRows(
        initialItems.length > 0
          ? initialItems.map(fromOrderItem)
          : [createEmptyRow()]
      )
    }
  }, [open, order, initialItems])

  // 提交
  const handleSubmit = async () => {
    const validationError = validateItemRows(itemRows)
    if (validationError) {
      toast.error(validationError)
      return
    }

    const result = await orderApi.update({
      orderId: order.id,
      items: extractValidItems(itemRows),
      remark: remark.trim() || undefined,
    })

    result.match(
      () => {
        toast.success('订单已更新')
        onConfirm()
      },
      (err) => toast.error(`更新失败: ${err.message}`)
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>编辑订单</DialogTitle>
            <Badge variant="secondary">
              {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {order.orderNo}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 提示：类型和客户不可修改 */}
          <p className="text-xs text-muted-foreground">
            订单类型和客户不可修改，仅可编辑明细和备注。
          </p>

          {/* 订单明细 */}
          <OrderItemRowEditor
            orderType={order.orderType as 'Sales' | 'Purchase'}
            items={itemRows}
            onItemsChange={setItemRows}
          />

          {/* 备注 */}
          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea
              placeholder="可选备注..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || itemRows.length === 0}
          >
            {loading ? '保存中...' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

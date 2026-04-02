/**
 * 结账确认对话框组件
 * 显示订单摘要、可修改实收金额
 */

import { useState, useEffect } from 'react'

import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import type { Order } from '@/api/commands/order/type'
import { ORDER_TYPE_DISPLAY_TEXT } from '@/api/commands/order/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type SettleOrderDialogProps = {
  open: boolean
  order: Order | null
  onClose: () => void
  onConfirm: (actualAmount: number) => void
  loading?: boolean
}

export const SettleOrderDialog: React.FC<SettleOrderDialogProps> = ({
  open,
  order,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [actualAmount, setActualAmount] = useState('')

  useEffect(() => {
    if (open && order) {
      setActualAmount(order.actualAmount.toString())
    }
  }, [open, order])

  if (!order) {
    return null
  }

  const handleSubmit = () => {
    const amount = Number.parseFloat(actualAmount)
    if (Number.isNaN(amount) || amount < 0) {
      return
    }
    onConfirm(amount)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            结账 - {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}订单
          </DialogTitle>
          <DialogDescription>
            确认结账订单 {order.orderNo}，结账后将自动生成记账记录。
          </DialogDescription>
        </DialogHeader>

        {/* 订单摘要 */}
        <div className="space-y-3 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">订单编号：</span>
              <span className="font-medium">{order.orderNo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">支付渠道：</span>
              <span className="font-medium">
                {ACCOUNTING_CHANNEL_DISPLAY_TEXT[
                  order.channel as keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT
                ] ?? order.channel}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">应收金额：</span>
              <span className="font-medium">
                ¥{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 实收金额输入 */}
          <div className="space-y-2">
            <Label htmlFor="actualAmount">实收金额</Label>
            <Input
              id="actualAmount"
              type="number"
              step="0.01"
              min="0"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              placeholder="请输入实收金额"
            />
            <p className="text-xs text-muted-foreground">
              可修改实收金额（支持抹零/让利），默认等于应收金额。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '结账中...' : '确认结账'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

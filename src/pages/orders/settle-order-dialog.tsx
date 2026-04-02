/**
 * 结账确认对话框组件
 * 显示订单摘要、支付渠道选择（必填）、可修改实收金额
 */

import { useState, useEffect } from 'react'

import {
  AccountingChannel,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SettleOrderDialogProps = {
  open: boolean
  order: Order | null
  onClose: () => void
  onConfirm: (data: { channel: string; actualAmount: number }) => void
  loading?: boolean
}

export const SettleOrderDialog: React.FC<SettleOrderDialogProps> = ({
  open,
  order,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [channel, setChannel] = useState<string>('')
  const [actualAmount, setActualAmount] = useState('')
  const [channelError, setChannelError] = useState(false)

  useEffect(() => {
    if (open && order) {
      setChannel('')
      setActualAmount(order.actualAmount.toString())
      setChannelError(false)
    }
  }, [open, order])

  if (!order) {
    return null
  }

  const handleSubmit = () => {
    if (!channel) {
      setChannelError(true)
      return
    }
    const amount = Number.parseFloat(actualAmount)
    if (Number.isNaN(amount) || amount < 0) {
      return
    }
    onConfirm({ channel, actualAmount: amount })
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
              <span className="text-muted-foreground">应收金额：</span>
              <span className="font-medium">
                ¥{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 支付渠道选择（必填） */}
          <div className="space-y-2">
            <Label>
              支付渠道 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={channel}
              onValueChange={(val) => {
                setChannel(val)
                setChannelError(false)
              }}
            >
              <SelectTrigger
                className={channelError ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="请选择支付渠道" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT)
                  .filter(([key]) => key !== AccountingChannel.Unknown)
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {channelError && (
              <p className="text-xs text-destructive">请选择支付渠道</p>
            )}
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

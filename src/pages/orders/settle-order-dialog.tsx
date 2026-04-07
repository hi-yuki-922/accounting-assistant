/**
 * 结账确认对话框组件
 * 显示订单摘要、支付渠道选择（必填）、可修改实收金额
 */

import { useState, useEffect } from 'react'

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
import { Spinner } from '@/components/ui/spinner'
import {
  getDefaultSettleOrderFormData,
  SettleOrderForm,
  validateSettleOrderForm,
} from '@/pages/orders/components/settle-order-form'
import type { SettleOrderFormData } from '@/pages/orders/components/settle-order-form'

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
  const [formData, setFormData] = useState<SettleOrderFormData>({
    channel: '',
    actualAmount: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  /** 对话框打开时初始化表单数据 */
  useEffect(() => {
    if (open && order) {
      setFormData(getDefaultSettleOrderFormData(order))
      setErrors({})
    }
  }, [open, order])

  if (!order) {
    return null
  }

  /** 提交结账 */
  const handleSubmit = () => {
    const validationErrors = validateSettleOrderForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onConfirm({
      channel: formData.channel,
      actualAmount: Number.parseFloat(formData.actualAmount),
    })
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

        <SettleOrderForm
          value={formData}
          onChange={setFormData}
          order={order}
          errors={errors}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Spinner />}
            确认结账
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

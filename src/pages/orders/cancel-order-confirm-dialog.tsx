/**
 * 取消订单确认对话框组件
 */

import { AlertTriangle } from 'lucide-react'

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

export type CancelOrderConfirmDialogProps = {
  open: boolean
  order: Order | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const CancelOrderConfirmDialog: React.FC<
  CancelOrderConfirmDialogProps
> = ({ open, order, onClose, onConfirm, loading = false }) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <DialogTitle>确认取消订单</DialogTitle>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4">
        <DialogDescription className="text-base">
          确定要取消{ORDER_TYPE_DISPLAY_TEXT[order?.orderType ?? 'Sales']}订单 "
          <strong className="text-foreground">{order?.orderNo}</strong>" 吗？
        </DialogDescription>
        <DialogDescription className="text-sm mt-3 text-orange-600 dark:text-orange-400">
          取消后订单不可恢复，也不能再结账。
        </DialogDescription>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          返回
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? '取消中...' : '确认取消'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

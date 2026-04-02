/**
 * 删除商品确认对话框组件
 */

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type DeleteProductConfirmDialogProps = {
  open: boolean
  product: {
    name: string
    unit: string
    category?: string
  }
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const DeleteProductConfirmDialog: React.FC<
  DeleteProductConfirmDialogProps
> = ({ open, product, onClose, onConfirm, loading = false }) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <DialogTitle>确认删除商品</DialogTitle>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4">
        <DialogDescription className="text-base">
          确定要删除商品 "
          <strong className="text-foreground">{product.name}</strong>"
          {product.category && `（${product.category}）`}
          ，单位 {product.unit} 吗？
        </DialogDescription>
        <DialogDescription className="text-sm mt-3 text-orange-600 dark:text-orange-400">
          此操作无法撤销，请谨慎操作。
        </DialogDescription>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? '删除中...' : '删除'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

/**
 * 删除账本确认对话框组件
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

export interface DeleteBookConfirmDialogProps {
  /** 是否打开对话框 */
  open: boolean
  /** 要删除的账本 */
  book: {
    title: string
    recordCount: number
  }
  /** 关闭对话框回调 */
  onClose: () => void
  /** 确认删除回调 */
  onConfirm: () => void
  /** 加载中状态 */
  loading?: boolean
}

export const DeleteBookConfirmDialog: React.FC<
  DeleteBookConfirmDialogProps
> = ({ open, book, onClose, onConfirm, loading = false }) => (
  <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div>
            <DialogTitle>确认删除账本</DialogTitle>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4">
        <DialogDescription className="text-base">
          确定要删除账本"
          <strong className="text-foreground">{book.title}</strong>
          "吗？
        </DialogDescription>
        {book.recordCount > 0 && (
          <DialogDescription className="text-sm mt-2 text-muted-foreground">
            该账本下的{' '}
            <strong className="text-foreground">{book.recordCount}</strong>{' '}
            条记录将迁移到"未归类账目"。
          </DialogDescription>
        )}
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

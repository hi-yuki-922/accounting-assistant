/**
 * 品类删除确认弹窗
 */

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DeleteCategoryConfirmDialogProps = {
  open: boolean
  categoryName: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const DeleteCategoryConfirmDialog: React.FC<
  DeleteCategoryConfirmDialogProps
> = ({ open, categoryName, onClose, onConfirm, loading }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>确认删除</DialogTitle>
        <DialogDescription>
          确定要删除品类「{categoryName}」吗？删除后不可恢复。
        </DialogDescription>
      </DialogHeader>
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

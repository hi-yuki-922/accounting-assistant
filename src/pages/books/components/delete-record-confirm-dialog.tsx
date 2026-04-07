/**
 * 删除记录确认对话框组件
 */

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatRawAmount } from '@/lib/formatters'

type DeleteRecordConfirmDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 要删除的记录 */
  record: RecordWithCountDto
}

export const DeleteRecordConfirmDialog: React.FC<
  DeleteRecordConfirmDialogProps
> = ({ open, onClose, onSuccess, record }) => {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)

    const result = await accounting.delete(record.id)

    result.match(
      () => {
        toast.success('删除成功')
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`删除失败：${error.message}`)
      }
    )

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <div>
              <DialogTitle>确认删除记录</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <DialogDescription className="text-base">
            确定要删除记录 "
            <strong className="text-foreground">{record.title}</strong>" 吗？
          </DialogDescription>

          <div className="mt-3 space-y-1 rounded-lg border bg-muted/50 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">金额</span>
              <span className="font-medium">
                {formatRawAmount(record.amount)}
              </span>
            </div>
          </div>

          <DialogDescription className="text-sm mt-3 text-destructive">
            此操作无法撤销，删除后数据将无法恢复。
          </DialogDescription>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '删除中...' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 批量入账确认对话框组件
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

type BatchPostConfirmDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 选中的记录列表 */
  selectedRecords: RecordWithCountDto[]
}

export const BatchPostConfirmDialog: React.FC<BatchPostConfirmDialogProps> = ({
  open,
  onClose,
  onSuccess,
  selectedRecords,
}) => {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    const ids = selectedRecords.map((record) => record.id)

    setLoading(true)

    const result = await accounting.batchPost(ids)

    result.match(
      () => {
        toast.success(`已成功入账 ${ids.length} 条记录`)
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`批量入账失败：${error.message}`)
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
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <DialogTitle>确认批量入账</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <DialogDescription className="text-base">
            确认将选中的{' '}
            <strong className="text-foreground">
              {selectedRecords.length}
            </strong>{' '}
            条记录进行入账操作？
          </DialogDescription>

          <DialogDescription className="text-sm mt-3 text-orange-600 dark:text-orange-400">
            注意：入账后记录将不可修改，只能通过冲账操作进行调整。
          </DialogDescription>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? '入账中...' : '确认入账'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

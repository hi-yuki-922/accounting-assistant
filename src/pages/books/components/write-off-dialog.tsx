/**
 * 冲账对话框组件
 * 负责对话框外壳、状态管理与 API 调用
 */

import { format } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import {
  WriteOffForm,
  getDefaultWriteOffFormData,
  validateWriteOffForm,
} from './write-off-form'
import type { WriteOffFormData } from './write-off-form'

type WriteOffDialogProps = {
  /** 是否打开对话框 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 操作成功回调 */
  onSuccess: () => void
  /** 原始记录 */
  record: RecordWithCountDto
}

/** 获取当前时间的 "YYYY-MM-DD HH:mm:ss" 格式字符串 */
const getCurrentRecordTime = (): string =>
  format(new Date(), 'yyyy-MM-dd HH:mm:ss')

export const WriteOffDialog: React.FC<WriteOffDialogProps> = ({
  open,
  onClose,
  onSuccess,
  record,
}) => {
  const [formData, setFormData] = useState<WriteOffFormData>(
    getDefaultWriteOffFormData(record)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // 打开时重置表单并设置默认值
  useEffect(() => {
    if (open) {
      setFormData(getDefaultWriteOffFormData(record))
      setErrors({})
    }
  }, [open, record])

  const handleSubmit = async () => {
    const validationErrors = validateWriteOffForm(formData, record.netAmount)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const writeOffNum = Number.parseFloat(formData.writeOffAmount)

    const result = await accounting.createWriteOff({
      originalRecordId: record.id,
      amount: writeOffNum,
      channel: formData.channel,
      remark: formData.remark.trim() || undefined,
      recordTime: getCurrentRecordTime(),
    })

    result.match(
      () => {
        toast.success('冲账成功')
        onSuccess()
        onClose()
      },
      (error) => {
        toast.error(`冲账失败：${error.message}`)
      }
    )

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>冲账</DialogTitle>
        </DialogHeader>

        <WriteOffForm
          value={formData}
          onChange={setFormData}
          record={record}
          errors={errors}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Spinner className="mr-2" />}
            {loading ? '提交中...' : '确认冲账'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

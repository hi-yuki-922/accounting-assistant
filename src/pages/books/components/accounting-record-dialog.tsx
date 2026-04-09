/**
 * 创建/编辑记账记录对话框
 * 合并原有的 AddRecordDialog 和 EditRecordDialog
 * 通过 record prop 区分创建/编辑模式
 */

import { useState, useEffect } from 'react'
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
  RecordForm,
  getDefaultRecordFormData,
  getRecordFormDataFromRecord,
  validateRecordForm,
  formatRecordTime,
} from './record-form'
import type { RecordFormData } from './record-form'

export type CreateEditRecordDialogProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  /** 账本 ID（创建模式需要） */
  bookId?: number
  /** 要编辑的记录（有值时为编辑模式，无值时为创建模式） */
  record?: RecordWithCountDto | null
}

const getSubmitButtonText = (isLoading: boolean, edit: boolean): string => {
  if (isLoading) {
    return '提交中...'
  }
  return edit ? '保存' : '确认添加'
}

export const AccountingRecordDialog = ({
  open,
  onClose,
  onSuccess,
  bookId,
  record,
}: CreateEditRecordDialogProps) => {
  const isEdit = !!record

  const [formData, setFormData] = useState<RecordFormData>(
    getDefaultRecordFormData()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // 初始化/重置表单
  useEffect(() => {
    if (open) {
      if (isEdit && record) {
        setFormData(getRecordFormDataFromRecord(record))
      } else {
        setFormData(getDefaultRecordFormData())
      }
      setErrors({})
    }
  }, [open, isEdit, record])

  const handleSubmit = async () => {
    const validationErrors = validateRecordForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    const amountNum = Number.parseFloat(formData.amount)

    if (isEdit && record) {
      const result = await accounting.update({
        id: record.id,
        title: formData.title.trim(),
        amount: amountNum,
        recordTime: formatRecordTime(formData.date, formData.time),
        remark: formData.remark.trim() || null,
      })

      result.match(
        () => {
          toast.success('修改成功')
          onSuccess()
          onClose()
        },
        (error) => {
          toast.error(`修改失败：${error.message}`)
        }
      )
    } else {
      const result = await accounting.create({
        title: formData.title.trim(),
        amount: amountNum,
        recordTime: formatRecordTime(formData.date, formData.time),
        accountingType: formData.accountingType,
        channel: formData.channel,
        remark: formData.remark.trim() || undefined,
        bookId: bookId as number,
      })

      result.match(
        () => {
          toast.success('添加成功')
          onSuccess()
          onClose()
        },
        (error) => {
          toast.error(`添加失败：${error.message}`)
        }
      )
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑记录' : '记一笔'}</DialogTitle>
        </DialogHeader>

        <RecordForm
          mode={isEdit ? 'edit' : 'create'}
          record={record ?? undefined}
          value={formData}
          onChange={setFormData}
          errors={errors}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {getSubmitButtonText(loading, isEdit)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

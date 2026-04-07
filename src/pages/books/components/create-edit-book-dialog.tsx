/**
 * 创建/编辑账本对话框组件
 */

import { useState, useEffect } from 'react'

import type { AccountingBook } from '@/api/commands/accounting-book/type'
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
  BookForm,
  getDefaultBookFormData,
  getBookFormDataFromBook,
  validateBookForm,
} from './book-form'
import type { BookFormData } from './book-form'

export interface CreateEditBookDialogProps {
  /** 是否打开对话框 */
  open: boolean
  /** 编辑模式下的账本数据（创建模式为空） */
  book?: AccountingBook | null
  /** 关闭对话框回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: (data: {
    title: string
    description: string
    icon: string
  }) => void
  /** 加载中状态 */
  loading?: boolean
}

const getConfirmButtonText = (isLoading: boolean, hasBook: boolean): string => {
  if (isLoading) {
    return '保存中...'
  }
  return hasBook ? '保存' : '创建'
}

export const CreateEditBookDialog: React.FC<CreateEditBookDialogProps> = ({
  open,
  book,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [formData, setFormData] = useState<BookFormData>(getDefaultBookFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 对话框打开时初始化表单数据
  useEffect(() => {
    setFormData(book ? getBookFormDataFromBook(book) : getDefaultBookFormData())
    setErrors({})
  }, [book, open])

  const handleConfirm = () => {
    const validationErrors = validateBookForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    onConfirm({
      title: formData.title.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? '编辑账本' : '新建账本'}</DialogTitle>
        </DialogHeader>

        <BookForm value={formData} onChange={setFormData} errors={errors} />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner className="size-4" />}
            {getConfirmButtonText(loading, !!book)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

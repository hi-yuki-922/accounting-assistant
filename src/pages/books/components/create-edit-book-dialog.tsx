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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BookIcon } from '@/config/book-icons'

import { BookIconPicker } from './book-icon-picker'

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

export const CreateEditBookDialog: React.FC<CreateEditBookDialogProps> = ({
  open,
  book,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('folder')
  const [error, setError] = useState('')

  // 编辑模式时初始化表单数据
  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setDescription(book.description || '')
      setSelectedIcon(book.icon || 'folder')
    } else {
      setTitle('')
      setDescription('')
      setSelectedIcon('folder')
    }
    setError('')
  }, [book, open])

  const handleConfirm = () => {
    // 验证标题
    if (!title.trim()) {
      setError('请输入账本标题')
      return
    }

    if (title.trim().length > 20) {
      setError('账本标题不能超过 20 个字符')
      return
    }

    setError('')
    onConfirm({
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
    })
  }

  const handleSelectIcon = (icon: BookIcon) => {
    setSelectedIcon(icon.id)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? '编辑账本' : '新建账本'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 标题输入 */}
          <div className="space-y-2">
            <Label htmlFor="book-title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
              placeholder="请输入账本标题"
              maxLength={20}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              最多 {title.length}/20 个字符
            </p>
          </div>

          {/* 图标选择 */}
          <div className="space-y-2">
            <Label>图标</Label>
            <BookIconPicker
              selectedIcon={selectedIcon}
              onSelectIcon={handleSelectIcon}
            />
          </div>

          {/* 描述输入 */}
          <div className="space-y-2">
            <Label htmlFor="book-description">描述（可选）</Label>
            <Textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入账本描述"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? '保存中...' : (book ? '保存' : '创建')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

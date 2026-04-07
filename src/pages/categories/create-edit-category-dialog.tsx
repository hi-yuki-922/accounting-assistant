/**
 * 品类创建/编辑弹窗
 */

import { useState, useEffect } from 'react'

import type { Category } from '@/api/commands/category/type'
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/api/commands/category/type'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CategoryForm } from './category-form'
import type { CategoryFormData } from './category-form'

const DEFAULT_FORM_DATA: CategoryFormData = {
  name: '',
  sellBookId: 0,
  purchaseBookId: 0,
  remark: '',
}

type CreateEditCategoryDialogProps = {
  open: boolean
  category?: Category | null
  onClose: () => void
  onConfirm: (data: CreateCategoryDto | UpdateCategoryDto) => void
  loading?: boolean
}

export const CreateEditCategoryDialog: React.FC<
  CreateEditCategoryDialogProps
> = ({ open, category, onClose, onConfirm, loading }) => {
  const isEdit = !!category
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM_DATA)

  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name,
          sellBookId: category.sellBookId,
          purchaseBookId: category.purchaseBookId,
          remark: category.remark || '',
        })
      } else {
        setFormData(DEFAULT_FORM_DATA)
      }
    }
  }, [open, category])

  const isValid =
    formData.name.trim() !== '' &&
    formData.sellBookId > 0 &&
    formData.purchaseBookId > 0

  const handleSubmit = () => {
    if (!isValid) {
      return
    }

    if (isEdit && category) {
      const dto: UpdateCategoryDto = {
        id: category.id,
        sellBookId: formData.sellBookId,
        purchaseBookId: formData.purchaseBookId,
        remark: formData.remark || null,
      }
      // 仅在名称可编辑时才传递
      if (category.name !== '未分类') {
        dto.name = formData.name.trim()
      }
      onConfirm(dto)
    } else {
      const dto: CreateCategoryDto = {
        name: formData.name.trim(),
        sellBookId: formData.sellBookId,
        purchaseBookId: formData.purchaseBookId,
        remark: formData.remark || undefined,
      }
      onConfirm(dto)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑品类' : '新增品类'}</DialogTitle>
        </DialogHeader>

        <CategoryForm
          value={formData}
          onChange={setFormData}
          editingCategory={category}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? '保存中...' : '确认'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

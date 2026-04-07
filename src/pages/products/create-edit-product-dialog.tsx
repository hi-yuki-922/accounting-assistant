/**
 * 新增/编辑商品 Dialog 弹窗组件
 */

import { useState, useEffect, useCallback } from 'react'

import type {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '@/api/commands/product/type'
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
  ProductForm,
  getDefaultProductFormData,
  getProductFormDataFromProduct,
  joinKeywords,
  validateProductForm,
} from './product-form'
import type { ProductFormData } from './product-form'

export type CreateEditProductDialogProps = {
  open: boolean
  product?: Product | null
  onClose: () => void
  onConfirm: (data: CreateProductDto | UpdateProductDto) => void
  loading?: boolean
}

export const CreateEditProductDialog = ({
  open,
  product,
  onClose,
  onConfirm,
  loading = false,
}: CreateEditProductDialogProps) => {
  const isEdit = !!product

  const [formData, setFormData] = useState<ProductFormData>(
    getDefaultProductFormData()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 弹窗打开时初始化表单数据
  useEffect(() => {
    if (open) {
      setFormData(
        product
          ? getProductFormDataFromProduct(product)
          : getDefaultProductFormData()
      )
      setErrors({})
    }
  }, [open, product])

  /** 表单数据变更时清除已变化字段的错误 */
  const handleFormChange = useCallback(
    (data: ProductFormData) => {
      setErrors((prev) => {
        const next: Record<string, string> = {}
        let hasValidKey = false
        for (const [key, value] of Object.entries(prev)) {
          const fieldKey = key as keyof ProductFormData
          if (data[fieldKey] === formData[fieldKey]) {
            next[key] = value
          } else {
            hasValidKey = true
          }
        }
        return hasValidKey ? next : prev
      })
      setFormData(data)
    },
    [formData]
  )

  const handleConfirm = () => {
    const validationErrors = validateProductForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const keywordsStr =
      formData.keywordsTags.length > 0
        ? joinKeywords(formData.keywordsTags)
        : ''

    if (isEdit && product) {
      const dto: UpdateProductDto = {
        id: product.id,
        name: formData.name.trim(),
        category: formData.category.trim() || null,
        unit: formData.unit.trim(),
        defaultSellPrice: formData.sellPrice.trim()
          ? Number(formData.sellPrice)
          : null,
        defaultPurchasePrice: formData.purchasePrice.trim()
          ? Number(formData.purchasePrice)
          : null,
        sku: formData.sku.trim() || null,
        keywords: keywordsStr || null,
        remark: formData.remark.trim() || null,
      }
      onConfirm(dto)
    } else {
      const dto: CreateProductDto = {
        name: formData.name.trim(),
        category: formData.category.trim() || undefined,
        unit: formData.unit.trim(),
        defaultSellPrice: formData.sellPrice.trim()
          ? Number(formData.sellPrice)
          : undefined,
        defaultPurchasePrice: formData.purchasePrice.trim()
          ? Number(formData.purchasePrice)
          : undefined,
        sku: formData.sku.trim() || undefined,
        keywords: keywordsStr || undefined,
        remark: formData.remark.trim() || undefined,
      }
      onConfirm(dto)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑商品' : '新增商品'}</DialogTitle>
        </DialogHeader>

        <ProductForm
          value={formData}
          onChange={handleFormChange}
          errors={errors}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Spinner data-icon="inline-start" />}
            {isEdit ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

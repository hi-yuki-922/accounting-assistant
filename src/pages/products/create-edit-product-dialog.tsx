/**
 * 新增/编辑商品 Dialog 弹窗组件
 */

import { useState, useEffect } from 'react'

import type {
  Product,
  CreateProductDto,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type CreateEditProductDialogProps = {
  open: boolean
  product?: Product | null
  onClose: () => void
  onConfirm: (data: CreateProductDto | UpdateProductDto) => void
  loading?: boolean
}

export const CreateEditProductDialog: React.FC<
  CreateEditProductDialogProps
> = ({ open, product, onClose, onConfirm, loading = false }) => {
  const isEdit = !!product

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sku, setSku] = useState('')
  const [remark, setRemark] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 编辑模式初始化
  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category ?? '')
      setUnit(product.unit)
      setSellPrice(product.defaultSellPrice?.toString() ?? '')
      setPurchasePrice(product.defaultPurchasePrice?.toString() ?? '')
      setSku(product.sku ?? '')
      setRemark(product.remark ?? '')
    } else {
      setName('')
      setCategory('')
      setUnit('')
      setSellPrice('')
      setPurchasePrice('')
      setSku('')
      setRemark('')
    }
    setErrors({})
  }, [product, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '请输入商品名称'
    }

    if (!unit.trim()) {
      newErrors.unit = '请输入计量单位'
    }

    if (sellPrice.trim() && isNaN(Number(sellPrice))) {
      newErrors.sellPrice = '请输入有效的价格数字'
    }

    if (purchasePrice.trim() && isNaN(Number(purchasePrice))) {
      newErrors.purchasePrice = '请输入有效的价格数字'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (!validate()) {
      return
    }

    if (isEdit && product) {
      const dto: UpdateProductDto = {
        id: product.id,
        name: name.trim(),
        category: category.trim() || null,
        unit: unit.trim(),
        defaultSellPrice: sellPrice.trim() ? Number(sellPrice) : null,
        defaultPurchasePrice: purchasePrice.trim()
          ? Number(purchasePrice)
          : null,
        sku: sku.trim() || null,
        remark: remark.trim() || null,
      }
      onConfirm(dto)
    } else {
      const dto: CreateProductDto = {
        name: name.trim(),
        category: category.trim() || undefined,
        unit: unit.trim(),
        defaultSellPrice: sellPrice.trim() ? Number(sellPrice) : undefined,
        defaultPurchasePrice: purchasePrice.trim()
          ? Number(purchasePrice)
          : undefined,
        sku: sku.trim() || undefined,
        remark: remark.trim() || undefined,
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

        <div className="space-y-4 py-4">
          {/* 商品名称 */}
          <div className="space-y-2">
            <Label htmlFor="product-name">
              商品名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="请输入商品名称"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 商品分类 */}
          <div className="space-y-2">
            <Label htmlFor="product-category">商品分类</Label>
            <Input
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="请输入商品分类（可选）"
            />
          </div>

          {/* 计量单位 */}
          <div className="space-y-2">
            <Label htmlFor="product-unit">
              计量单位 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value)
                setErrors((prev) => ({ ...prev, unit: '' }))
              }}
              placeholder="如：斤、个、箱、盒"
              className={errors.unit ? 'border-destructive' : ''}
            />
            {errors.unit && (
              <p className="text-sm text-destructive">{errors.unit}</p>
            )}
          </div>

          {/* 参考售价 + 参考采购价 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-sell-price">参考售价</Label>
              <Input
                id="product-sell-price"
                type="number"
                step="0.01"
                value={sellPrice}
                onChange={(e) => {
                  setSellPrice(e.target.value)
                  setErrors((prev) => ({ ...prev, sellPrice: '' }))
                }}
                placeholder="0.00"
                className={errors.sellPrice ? 'border-destructive' : ''}
              />
              {errors.sellPrice && (
                <p className="text-sm text-destructive">{errors.sellPrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-purchase-price">参考采购价</Label>
              <Input
                id="product-purchase-price"
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => {
                  setPurchasePrice(e.target.value)
                  setErrors((prev) => ({ ...prev, purchasePrice: '' }))
                }}
                placeholder="0.00"
                className={errors.purchasePrice ? 'border-destructive' : ''}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-destructive">
                  {errors.purchasePrice}
                </p>
              )}
            </div>
          </div>

          {/* 商品编码 */}
          <div className="space-y-2">
            <Label htmlFor="product-sku">商品编码</Label>
            <Input
              id="product-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="请输入商品编码（可选）"
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="product-remark">备注</Label>
            <Textarea
              id="product-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入备注（可选）"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? '保存中...' : (isEdit ? '保存' : '创建')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

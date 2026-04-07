/**
 * 编辑订单对话框
 * 允许修改 Pending 状态订单的明细和备注
 * 不可修改订单类型和客户
 */

import { Plus, Trash2, Search } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { orderApi } from '@/api/commands/order'
import type { Order, OrderItem } from '@/api/commands/order/type'
import { ORDER_TYPE_DISPLAY_TEXT } from '@/api/commands/order/type'
import { productApi } from '@/api/commands/product'
import type { Product } from '@/api/commands/product/type'
import { Badge } from '@/components/ui/badge'
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
import { formatCurrency } from '@/lib/formatters'

/** 明细行类型 */
type ItemRow = {
  key: string
  productId: number
  productName: string
  quantity: string
  unit: string
  unitPrice: string
  subtotal: number
  remark: string
}

let editRowKeyCounter = 0

const createEmptyRow = (): ItemRow => ({
  key: `edit-row-${++editRowKeyCounter}`,
  productId: 0,
  productName: '',
  quantity: '1',
  unit: '',
  unitPrice: '0',
  subtotal: 0,
  remark: '',
})

const fromOrderItem = (item: OrderItem): ItemRow => ({
  key: `edit-row-${++editRowKeyCounter}`,
  productId: item.productId,
  productName: item.productName,
  quantity: item.quantity.toString(),
  unit: item.unit,
  unitPrice: item.unitPrice.toString(),
  subtotal: Number(item.subtotal),
  remark: item.remark ?? '',
})

export type EditOrderDialogProps = {
  open: boolean
  order: Order
  items: OrderItem[]
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  open,
  order,
  items: initialItems,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [remark, setRemark] = useState('')
  const [itemRows, setItemRows] = useState<ItemRow[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  )

  // 初始化
  useEffect(() => {
    if (open) {
      setRemark(order.remark ?? '')
      setItemRows(
        initialItems.length > 0
          ? initialItems.map(fromOrderItem)
          : [createEmptyRow()]
      )
      setSearchResults([])
      setActiveSearchIndex(null)
    }
  }, [open, order, initialItems])

  // 计算总额
  const totalAmount = itemRows.reduce((sum, item) => sum + item.subtotal, 0)

  // 搜索商品
  const handleSearchProduct = useCallback(
    async (keyword: string, index: number) => {
      setActiveSearchIndex(index)
      if (!keyword.trim()) {
        setSearchResults([])
        return
      }
      const result = await productApi.search(keyword.trim())
      result.match(
        (data) => setSearchResults(data),
        () => setSearchResults([])
      )
    },
    []
  )

  // 选择商品
  const handleSelectProduct = (product: Product, index: number) => {
    const price =
      order.orderType === 'Sales'
        ? product.defaultSellPrice
        : product.defaultPurchasePrice

    setItemRows((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item
        }
        const unitPrice = price?.toString() ?? '0'
        const quantity = item.quantity || '1'
        const subtotal =
          Number.parseFloat(quantity) * Number.parseFloat(unitPrice)
        return {
          ...item,
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          unitPrice,
          subtotal: Number.isNaN(subtotal) ? 0 : subtotal,
        }
      })
    )
    setSearchResults([])
    setActiveSearchIndex(null)
  }

  // 更新明细行
  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    setItemRows((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item
        }
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          const subtotal =
            Number.parseFloat(updated.quantity) *
            Number.parseFloat(updated.unitPrice)
          updated.subtotal = Number.isNaN(subtotal) ? 0 : subtotal
        }
        return updated
      })
    )
  }

  // 添加明细行
  const handleAddItem = () => {
    setItemRows((prev) => [...prev, createEmptyRow()])
  }

  // 删除明细行
  const handleRemoveItem = (index: number) => {
    setItemRows((prev) => prev.filter((_, i) => i !== index))
  }

  // 提交
  const handleSubmit = async () => {
    const validItems = itemRows.filter((item) => item.productName.trim())
    if (validItems.length === 0) {
      toast.error('订单明细不能为空')
      return
    }

    const result = await orderApi.update({
      orderId: order.id,
      items: validItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number.parseFloat(item.quantity) || 1,
        unit: item.unit,
        unitPrice: Number.parseFloat(item.unitPrice) || 0,
        remark: item.remark.trim() || undefined,
      })),
      remark: remark.trim() || undefined,
    })

    result.match(
      () => {
        toast.success('订单已更新')
        onConfirm()
      },
      (error) => toast.error(`更新失败: ${error.message}`)
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>编辑订单</DialogTitle>
            <Badge variant="secondary">
              {ORDER_TYPE_DISPLAY_TEXT[order.orderType]}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {order.orderNo}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 提示：类型和客户不可修改 */}
          <p className="text-xs text-muted-foreground">
            订单类型和客户不可修改，仅可编辑明细和备注。
          </p>

          {/* 订单明细 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>订单明细</Label>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                添加明细
              </Button>
            </div>

            {itemRows.map((item, index) => (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg"
              >
                {/* 商品名称（带搜索） */}
                <div className="col-span-3 relative">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="pl-7 h-8 text-sm"
                      placeholder="搜索商品..."
                      value={item.productName}
                      onChange={(e) => {
                        updateItem(index, 'productName', e.target.value)
                        updateItem(index, 'productId', '0')
                        handleSearchProduct(e.target.value, index)
                      }}
                    />
                  </div>
                  {activeSearchIndex === index && searchResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-32 overflow-y-auto">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                          onClick={() => handleSelectProduct(product, index)}
                        >
                          {product.name}
                          <span className="text-muted-foreground ml-2">
                            {formatCurrency(product.defaultSellPrice)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 数量 */}
                <div className="col-span-2">
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="数量"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', e.target.value)
                    }
                  />
                </div>

                {/* 单位（只读） */}
                <div className="col-span-1">
                  <Input
                    className="h-8 text-sm bg-muted"
                    placeholder="单位"
                    value={item.unit}
                    readOnly
                  />
                </div>

                {/* 单价 */}
                <div className="col-span-2">
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="单价"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, 'unitPrice', e.target.value)
                    }
                  />
                </div>

                {/* 小计 */}
                <div className="col-span-2 flex items-center h-8">
                  <span className="text-sm font-medium">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>

                {/* 删除按钮 */}
                <div className="col-span-2 flex items-center justify-end h-8">
                  {itemRows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveItem(index)}
                      aria-label="删除明细"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 总额 */}
          <div className="flex items-center justify-end gap-4 text-sm">
            <span className="text-muted-foreground">应收总额：</span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea
              placeholder="可选备注..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || itemRows.length === 0}
          >
            {loading ? '保存中...' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

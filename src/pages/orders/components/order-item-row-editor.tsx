/**
 * 订单明细行编辑器组件
 * 封装商品搜索、明细行增删改、金额计算等逻辑
 * 由 CreateOrderDialog 和 EditOrderDialog 复用
 */

import { Plus, Trash2, Search } from 'lucide-react'
import { useState, useCallback } from 'react'

import type { OrderItem } from '@/api/commands/order/type'
import { productApi } from '@/api/commands/product'
import type { Product } from '@/api/commands/product/type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/formatters'

/** 明细行状态类型 */
export type ItemRow = {
  key: string
  productId: number
  productName: string
  quantity: string
  unit: string
  unitPrice: string
  subtotal: number
  remark: string
}

let rowKeyCounter = 0

/** 创建空明细行 */
export const createEmptyRow = (): ItemRow => {
  rowKeyCounter += 1
  return {
    key: `row-${rowKeyCounter}`,
    productId: 0,
    productName: '',
    quantity: '1',
    unit: '',
    unitPrice: '0',
    subtotal: 0,
    remark: '',
  }
}

/** 从 OrderItem 创建明细行 */
export const fromOrderItem = (item: OrderItem): ItemRow => {
  rowKeyCounter += 1
  return {
    key: `row-${rowKeyCounter}`,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity.toString(),
    unit: item.unit,
    unitPrice: item.unitPrice.toString(),
    subtotal: Number(item.subtotal),
    remark: item.remark ?? '',
  }
}

/** 校验明细行是否有效 */
export const validateItemRows = (items: ItemRow[]): string | null => {
  const valid = items.filter((i) => i.productName.trim())
  if (valid.length === 0) {
    return '订单明细不能为空'
  }
  return null
}

/** 从明细行中提取有效的提交数据 */
export const extractValidItems = (
  items: ItemRow[]
): {
  productId: number
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  remark?: string
}[] =>
  items
    .filter((i) => i.productName.trim())
    .map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: Number.parseFloat(item.quantity) || 1,
      unit: item.unit,
      unitPrice: Number.parseFloat(item.unitPrice) || 0,
      remark: item.remark.trim() || undefined,
    }))

export type OrderItemRowEditorProps = {
  /** 当前订单类型，决定选择商品时取售价还是采购价 */
  orderType: 'Sales' | 'Purchase'
  /** 明细行数据（受控模式） */
  items: ItemRow[]
  /** 明细行变更回调 */
  onItemsChange: (items: ItemRow[]) => void
}

/**
 * 订单明细行编辑器
 * 管理商品搜索、行增删改、金额计算
 */
export const OrderItemRowEditor = ({
  orderType,
  items,
  onItemsChange,
}: OrderItemRowEditorProps) => {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  )

  // 计算总额
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

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
      orderType === 'Sales'
        ? product.defaultSellPrice
        : product.defaultPurchasePrice

    onItemsChange(
      items.map((item, i) => {
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

  // 更新明细行字段
  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    onItemsChange(
      items.map((item, i) => {
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
    onItemsChange([...items, createEmptyRow()])
  }

  // 删除明细行
  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>订单明细</Label>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-1" />
          添加明细
        </Button>
      </div>

      {items.map((item, index) => (
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
                    {product.sku && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        {product.sku}
                      </span>
                    )}
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
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
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
              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
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
            {items.length > 1 && (
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

      {/* 总额 */}
      <div className="flex items-center justify-end gap-4 text-sm">
        <span className="text-muted-foreground">应收总额：</span>
        <span className="text-lg font-bold text-foreground">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  )
}

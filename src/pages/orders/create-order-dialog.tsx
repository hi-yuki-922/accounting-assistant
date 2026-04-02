/**
 * 创建订单对话框组件
 * 支持类型选择、客户选择、明细行管理、商品搜索、金额计算、渠道选择
 */

import { Plus, Trash2, Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { AccountingChannel } from '@/api/commands/accounting/enums'
import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
import { productApi } from '@/api/commands/product'
import type { Product } from '@/api/commands/product/type'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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

export type CreateOrderDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    orderType: string
    customerId?: number
    channel: string
    items: {
      productId: number
      productName: string
      quantity: number
      unit: string
      unitPrice: number
      remark?: string
    }[]
    remark?: string
    actualAmount?: number
  }) => void
  loading?: boolean
}

let rowKeyCounter = 0

const createEmptyRow = (): ItemRow => ({
  key: `row-${++rowKeyCounter}`,
  productId: 0,
  productName: '',
  quantity: '1',
  unit: '',
  unitPrice: '0',
  subtotal: 0,
  remark: '',
})

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [orderType, setOrderType] = useState('Sales')
  const [channel, setChannel] = useState<string>(AccountingChannel.Cash)
  const [remark, setRemark] = useState('')
  const [items, setItems] = useState<ItemRow[]>([createEmptyRow()])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  )

  // 重置表单
  useEffect(() => {
    if (open) {
      setOrderType('Sales')
      setChannel(AccountingChannel.Cash)
      setRemark('')
      setItems([createEmptyRow()])
      setSearchResults([])
      setActiveSearchIndex(null)
    }
  }, [open])

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

    setItems((prev) =>
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
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item
        }
        const updated = { ...item, [field]: value }
        // 重算小计
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
    setItems((prev) => [...prev, createEmptyRow()])
  }

  // 删除明细行
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // 提交
  const handleSubmit = () => {
    const validItems = items.filter((item) => item.productName.trim())
    if (validItems.length === 0) {
      return
    }

    onConfirm({
      orderType,
      channel,
      remark: remark.trim() || undefined,
      items: validItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number.parseFloat(item.quantity) || 1,
        unit: item.unit,
        unitPrice: Number.parseFloat(item.unitPrice) || 0,
        remark: item.remark.trim() || undefined,
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建订单</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 订单类型 + 渠道 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>订单类型</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">销售订单</SelectItem>
                  <SelectItem value="Purchase">采购订单</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>支付渠道</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 订单明细 */}
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
                  {/* 搜索结果下拉 */}
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
                            ¥{(product.defaultSellPrice ?? 0).toFixed(2)}
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

                {/* 单位 */}
                <div className="col-span-1">
                  <Input
                    className="h-8 text-sm"
                    placeholder="单位"
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
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
                    ¥{item.subtotal.toFixed(2)}
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
          </div>

          {/* 总额 */}
          <div className="flex items-center justify-end gap-4 text-sm">
            <span className="text-muted-foreground">应收总额：</span>
            <span className="text-lg font-bold text-foreground">
              ¥{totalAmount.toFixed(2)}
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
            disabled={loading || items.length === 0}
          >
            {loading ? '创建中...' : '创建订单'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

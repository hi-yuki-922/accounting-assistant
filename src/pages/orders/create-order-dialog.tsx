/**
 * 创建订单对话框组件
 * 支持类型选择、客户选择、明细行管理
 * 不包含支付渠道选择（渠道在结账时选择）
 */

import { X } from 'lucide-react'
import React, { useState, useEffect, useCallback, useRef } from 'react'

import { customerApi } from '@/api/commands/customer'
import type { Customer } from '@/api/commands/customer/type'
import {
  ORDER_SUB_TYPE_DISPLAY_TEXT,
  SALES_SUB_TYPES,
  PURCHASE_SUB_TYPES,
} from '@/api/commands/order/type'
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

import {
  OrderItemRowEditor,
  createEmptyRow,
  validateItemRows,
  extractValidItems,
} from './components/order-item-row-editor'
import type { ItemRow } from './components/order-item-row-editor'

export type CreateOrderDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: (data: {
    orderType: string
    customerId?: number
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
    subType?: string
  }) => void
  loading?: boolean
}

/** 根据 order_type 和 customer_id 获取默认 sub_type */
const getDefaultSubType = (orderType: string, customerId?: number): string => {
  if (orderType === 'Sales') {
    return customerId ? 'Wholesale' : 'Retail'
  }
  return 'WholesalePurchase'
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [orderType, setOrderType] = useState('Sales')
  const [subType, setSubType] = useState('Wholesale')
  const [customerId, setCustomerId] = useState<number | undefined>()
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState<
    Customer[]
  >([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [remark, setRemark] = useState('')
  const [items, setItems] = useState<ItemRow[]>([createEmptyRow()])

  // 重置表单
  useEffect(() => {
    if (open) {
      setOrderType('Sales')
      setSubType('Wholesale')
      setCustomerId(undefined)
      setCustomerSearch('')
      setCustomerSearchResults([])
      setShowCustomerDropdown(false)
      setSelectedCustomer(null)
      setRemark('')
      setItems([createEmptyRow()])
    }
  }, [open])

  // 点击外部关闭客户下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 搜索客户
  const handleSearchCustomer = useCallback(async (keyword: string) => {
    setCustomerSearch(keyword)
    if (!keyword.trim()) {
      setCustomerSearchResults([])
      setShowCustomerDropdown(false)
      return
    }
    const result = await customerApi.search(keyword.trim())
    result.match(
      (data) => {
        setCustomerSearchResults(data)
        setShowCustomerDropdown(true)
      },
      () => setCustomerSearchResults([])
    )
  }, [])

  // 选择客户 — 联动 subType 默认值
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerId(customer.id)
    setCustomerSearch(customer.name)
    setShowCustomerDropdown(false)
    if (orderType === 'Sales') {
      setSubType('Wholesale')
    }
  }

  // 清除客户选择 — 联动 subType 默认值
  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerId(undefined)
    setCustomerSearch('')
    setCustomerSearchResults([])
    if (orderType === 'Sales') {
      setSubType('Retail')
    }
  }

  // 切换订单类型 — 重置 subType
  const handleOrderTypeChange = (type: string) => {
    setOrderType(type)
    if (type === 'Sales') {
      setSubType(customerId ? 'Wholesale' : 'Retail')
    } else {
      setSubType('WholesalePurchase')
    }
  }

  const availableSubTypes =
    orderType === 'Sales' ? SALES_SUB_TYPES : PURCHASE_SUB_TYPES

  // 提交
  const handleSubmit = () => {
    const error = validateItemRows(items)
    if (error) {
      return
    }

    onConfirm({
      orderType,
      customerId,
      remark: remark.trim() || undefined,
      items: extractValidItems(items),
      subType,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建订单</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 订单类型 + 业务类型 + 客户选择 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>订单类型</Label>
              <Select value={orderType} onValueChange={handleOrderTypeChange}>
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
              <Label>业务类型</Label>
              <Select value={subType} onValueChange={setSubType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSubTypes.map((st) => (
                    <SelectItem key={st} value={st}>
                      {ORDER_SUB_TYPE_DISPLAY_TEXT[st]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>客户（可选）</Label>
              <div className="relative" ref={customerDropdownRef}>
                <div className="relative">
                  <Input
                    placeholder="搜索客户..."
                    value={customerSearch}
                    onChange={(e) => handleSearchCustomer(e.target.value)}
                  />
                  {selectedCustomer && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleClearCustomer}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {showCustomerDropdown && customerSearchResults.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-32 overflow-y-auto">
                    {customerSearchResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        {customer.name}
                        <span className="text-muted-foreground ml-2 text-xs">
                          {customer.phone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 订单明细 */}
          <OrderItemRowEditor
            orderType={orderType as 'Sales' | 'Purchase'}
            items={items}
            onItemsChange={setItems}
          />

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

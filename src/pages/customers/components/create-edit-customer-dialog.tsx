/**
 * 新增/编辑客户 Dialog 弹窗组件
 */

import { useState, useEffect } from 'react'

import type {
  Customer,
  CustomerCategory,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@/api/commands/customer/type'
import { CUSTOMER_CATEGORY_LABELS } from '@/api/commands/customer/type'
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

export type CreateEditCustomerDialogProps = {
  open: boolean
  customer?: Customer | null
  onClose: () => void
  onConfirm: (data: CreateCustomerDto | UpdateCustomerDto) => void
  loading?: boolean
}

export const CreateEditCustomerDialog: React.FC<
  CreateEditCustomerDialogProps
> = ({ open, customer, onClose, onConfirm, loading = false }) => {
  const isEdit = !!customer

  const [name, setName] = useState('')
  const [category, setCategory] = useState<CustomerCategory>('Retailer')
  const [phone, setPhone] = useState('')
  const [wechat, setWechat] = useState('')
  const [address, setAddress] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [remark, setRemark] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 编辑模式初始化
  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setCategory(customer.category)
      setPhone(customer.phone)
      setWechat(customer.wechat ?? '')
      setAddress(customer.address ?? '')
      setBankAccount(customer.bankAccount ?? '')
      setRemark(customer.remark ?? '')
    } else {
      setName('')
      setCategory('Retailer')
      setPhone('')
      setWechat('')
      setAddress('')
      setBankAccount('')
      setRemark('')
    }
    setErrors({})
  }, [customer, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '请输入客户姓名'
    }

    if (!phone.trim()) {
      newErrors.phone = '请输入联系电话'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (!validate()) {
      return
    }

    if (isEdit && customer) {
      const dto: UpdateCustomerDto = {
        id: customer.id,
        name: name.trim(),
        category,
        phone: phone.trim(),
        wechat: wechat.trim() || null,
        address: address.trim() || null,
        bankAccount: bankAccount.trim() || null,
        remark: remark.trim() || null,
      }
      onConfirm(dto)
    } else {
      const dto: CreateCustomerDto = {
        name: name.trim(),
        category,
        phone: phone.trim(),
        wechat: wechat.trim() || undefined,
        address: address.trim() || undefined,
        bankAccount: bankAccount.trim() || undefined,
        remark: remark.trim() || undefined,
      }
      onConfirm(dto)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑客户' : '新增客户'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 姓名 */}
          <div className="space-y-2">
            <Label htmlFor="customer-name">
              姓名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder="请输入客户姓名"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label>
              分类 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as CustomerCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择客户分类" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(CUSTOMER_CATEGORY_LABELS) as CustomerCategory[]
                ).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CUSTOMER_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 电话 */}
          <div className="space-y-2">
            <Label htmlFor="customer-phone">
              电话 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setErrors((prev) => ({ ...prev, phone: '' }))
              }}
              placeholder="请输入联系电话"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* 微信号 */}
          <div className="space-y-2">
            <Label htmlFor="customer-wechat">微信号</Label>
            <Input
              id="customer-wechat"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder="请输入微信号（可选）"
            />
          </div>

          {/* 地址 */}
          <div className="space-y-2">
            <Label htmlFor="customer-address">地址</Label>
            <Input
              id="customer-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入地址（可选）"
            />
          </div>

          {/* 银行账号 */}
          <div className="space-y-2">
            <Label htmlFor="customer-bank-account">银行账号</Label>
            <Input
              id="customer-bank-account"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="请输入银行账号（可选）"
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="customer-remark">备注</Label>
            <Textarea
              id="customer-remark"
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

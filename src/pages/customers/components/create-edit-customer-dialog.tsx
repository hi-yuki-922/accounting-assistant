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
  CustomerForm,
  getDefaultCustomerFormData,
  getCustomerFormDataFromCustomer,
  validateCustomerForm,
} from './customer-form'
import type { CustomerFormData } from './customer-form'

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

  const [formData, setFormData] = useState<CustomerFormData>(
    getDefaultCustomerFormData()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // open 变化时初始化表单数据
  useEffect(() => {
    if (customer) {
      setFormData(getCustomerFormDataFromCustomer(customer))
    } else {
      setFormData(getDefaultCustomerFormData())
    }
    setErrors({})
  }, [customer, open])

  const handleConfirm = () => {
    const validationErrors = validateCustomerForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isEdit && customer) {
      const dto: UpdateCustomerDto = {
        id: customer.id,
        name: formData.name.trim(),
        category: formData.category as CustomerCategory,
        phone: formData.phone.trim(),
        wechat: formData.wechat.trim() || null,
        address: formData.address.trim() || null,
        bankAccount: formData.bankAccount.trim() || null,
        remark: formData.remark.trim() || null,
      }
      onConfirm(dto)
    } else {
      const dto: CreateCustomerDto = {
        name: formData.name.trim(),
        category: formData.category as CustomerCategory,
        phone: formData.phone.trim(),
        wechat: formData.wechat.trim() || undefined,
        address: formData.address.trim() || undefined,
        bankAccount: formData.bankAccount.trim() || undefined,
        remark: formData.remark.trim() || undefined,
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

        <CustomerForm value={formData} onChange={setFormData} errors={errors} />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            {isEdit ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

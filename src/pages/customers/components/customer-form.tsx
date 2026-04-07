/**
 * 客户表单组件
 * 受控表单，用于新增/编辑客户时收集表单数据
 */

import type { Customer, CustomerCategory } from '@/api/commands/customer/type'
import { CUSTOMER_CATEGORY_LABELS } from '@/api/commands/customer/type'
import { Field, FieldTitle, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

/** 客户表单数据 */
export type CustomerFormData = {
  name: string
  category: string
  phone: string
  wechat: string
  address: string
  bankAccount: string
  remark: string
}

/** CustomerForm 组件 Props */
export type CustomerFormProps = {
  value: CustomerFormData
  onChange: (data: CustomerFormData) => void
  errors?: Record<string, string>
}

/** 获取默认的客户表单数据 */
export const getDefaultCustomerFormData = (): CustomerFormData => ({
  name: '',
  category: 'Retailer',
  phone: '',
  wechat: '',
  address: '',
  bankAccount: '',
  remark: '',
})

/** 从 Customer 模型提取表单数据 */
export const getCustomerFormDataFromCustomer = (
  customer: Customer
): CustomerFormData => ({
  name: customer.name,
  category: customer.category,
  phone: customer.phone,
  wechat: customer.wechat ?? '',
  address: customer.address ?? '',
  bankAccount: customer.bankAccount ?? '',
  remark: customer.remark ?? '',
})

/** 验证客户表单数据，返回错误信息映射 */
export const validateCustomerForm = (
  data: CustomerFormData
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.name.trim()) {
    errors.name = '请输入客户姓名'
  }

  if (!data.phone.trim()) {
    errors.phone = '请输入联系电话'
  }

  return errors
}

/** 客户表单组件 */
export const CustomerForm = ({
  value,
  onChange,
  errors = {},
}: CustomerFormProps) => {
  /** 更新单个字段并清除对应错误 */
  const updateField = (field: keyof CustomerFormData, val: string) => {
    const next = { ...value, [field]: val }
    onChange(next)
  }

  return (
    <div className="space-y-4 py-4">
      {/* 姓名 */}
      <Field orientation="vertical">
        <FieldTitle>
          姓名 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          value={value.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="请输入客户姓名"
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      {/* 分类 */}
      <Field orientation="vertical">
        <FieldTitle>
          分类 <span className="text-destructive">*</span>
        </FieldTitle>
        <Select
          value={value.category}
          onValueChange={(val) => updateField('category', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择客户分类" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CUSTOMER_CATEGORY_LABELS) as CustomerCategory[]).map(
              (cat) => (
                <SelectItem key={cat} value={cat}>
                  {CUSTOMER_CATEGORY_LABELS[cat]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </Field>

      {/* 电话 */}
      <Field orientation="vertical">
        <FieldTitle>
          电话 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          value={value.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="请输入联系电话"
        />
        {errors.phone && <FieldError>{errors.phone}</FieldError>}
      </Field>

      {/* 微信号 */}
      <Field orientation="vertical">
        <FieldTitle>微信号</FieldTitle>
        <Input
          value={value.wechat}
          onChange={(e) => updateField('wechat', e.target.value)}
          placeholder="请输入微信号（可选）"
        />
      </Field>

      {/* 地址 */}
      <Field orientation="vertical">
        <FieldTitle>地址</FieldTitle>
        <Input
          value={value.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="请输入地址（可选）"
        />
      </Field>

      {/* 银行账号 */}
      <Field orientation="vertical">
        <FieldTitle>银行账号</FieldTitle>
        <Input
          value={value.bankAccount}
          onChange={(e) => updateField('bankAccount', e.target.value)}
          placeholder="请输入银行账号（可选）"
        />
      </Field>

      {/* 备注 */}
      <Field orientation="vertical">
        <FieldTitle>备注</FieldTitle>
        <Textarea
          value={value.remark}
          onChange={(e) => updateField('remark', e.target.value)}
          placeholder="请输入备注（可选）"
          rows={2}
        />
      </Field>
    </div>
  )
}

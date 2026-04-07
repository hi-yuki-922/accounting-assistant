/**
 * 结账订单表单组件
 * 受控组件，封装渠道选择和实收金额输入
 */

import {
  AccountingChannel,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
import type { Order } from '@/api/commands/order/type'
import { Field, FieldError, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/formatters'

/** 表单数据类型 */
export type SettleOrderFormData = {
  channel: string
  actualAmount: string
}

/** 表单组件 Props */
export type SettleOrderFormProps = {
  /** 表单数据（受控） */
  value: SettleOrderFormData
  /** 表单数据变更回调 */
  onChange: (data: SettleOrderFormData) => void
  /** 当前订单 */
  order: Order
  /** 校验错误信息 */
  errors?: Record<string, string>
}

/** 校验表单数据，返回错误字段映射 */
export const validateSettleOrderForm = (
  data: SettleOrderFormData
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.channel) {
    errors.channel = '请选择支付渠道'
  }

  const amount = Number.parseFloat(data.actualAmount)
  if (Number.isNaN(amount) || amount < 0) {
    errors.actualAmount = '请输入有效的金额'
  }

  return errors
}

/** 根据订单生成默认表单数据 */
export const getDefaultSettleOrderFormData = (
  order: Order
): SettleOrderFormData => ({
  channel: '',
  actualAmount: order.actualAmount.toString(),
})

/** 结账订单表单 */
export const SettleOrderForm = ({
  value,
  onChange,
  order,
  errors = {},
}: SettleOrderFormProps) => {
  /** 更新单个字段 */
  const updateField = <K extends keyof SettleOrderFormData>(
    key: K,
    val: SettleOrderFormData[K]
  ) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="space-y-3 py-4">
      {/* 订单摘要 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">订单编号：</span>
          <span className="font-medium">{order.orderNo}</span>
        </div>
        <div>
          <span className="text-muted-foreground">应收金额：</span>
          <span className="font-medium">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* 支付渠道选择（必填） */}
      <Field>
        <FieldTitle>
          支付渠道 <span className="text-destructive">*</span>
        </FieldTitle>
        <Select
          value={value.channel}
          onValueChange={(val) => updateField('channel', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="请选择支付渠道" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT)
              .filter(([key]) => key !== AccountingChannel.Unknown)
              .map(([channelValue, label]) => (
                <SelectItem key={channelValue} value={channelValue}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.channel && <FieldError>{errors.channel}</FieldError>}
      </Field>

      {/* 实收金额输入 */}
      <Field>
        <FieldTitle>实收金额</FieldTitle>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value.actualAmount}
          onChange={(e) => updateField('actualAmount', e.target.value)}
          placeholder="请输入实收金额"
        />
        <p className="text-xs text-muted-foreground">
          可修改实收金额（支持抹零/让利），默认等于应收金额。
        </p>
        {errors.actualAmount && <FieldError>{errors.actualAmount}</FieldError>}
      </Field>
    </div>
  )
}

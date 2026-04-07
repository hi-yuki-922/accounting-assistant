/**
 * 结账订单表单组件
 * 受控组件，封装渠道选择、实收金额输入、结算预览
 */

import { useEffect, useState } from 'react'

import {
  AccountingChannel,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
import { orderApi } from '@/api/commands/order'
import type { SettlePreview } from '@/api/commands/order/type'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [preview, setPreview] = useState<SettlePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  /** 更新单个字段 */
  const updateField = <K extends keyof SettleOrderFormData>(
    key: K,
    val: SettleOrderFormData[K]
  ) => {
    onChange({ ...value, [key]: val })
  }

  // 实收金额变化时重新获取预览
  useEffect(() => {
    const amount = Number.parseFloat(value.actualAmount)
    if (Number.isNaN(amount) || amount < 0) {
      setPreview(null)
      return
    }

    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      const result = await orderApi.settlePreview(order.id, amount)
      result.match(
        (data) => {
          setPreview(data)
          setPreviewLoading(false)
        },
        () => {
          setPreview(null)
          setPreviewLoading(false)
        }
      )
    }, 300)

    return () => clearTimeout(timer)
  }, [value.actualAmount, order.id])

  const hasDiscount =
    preview?.discountAmount != null && preview.discountAmount !== 0

  return (
    <div className="space-y-3 py-4">
      {/* 订单摘要 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">订单编号：</span>
          <span className="font-medium">{order.orderNo}</span>
        </div>
        <div>
          <span className="text-muted-foreground">
            {order.orderType === 'Purchase' ? '应付金额：' : '应收金额：'}
          </span>
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

      {/* 实收/实付金额输入 */}
      <Field>
        <FieldTitle>
          {order.orderType === 'Purchase' ? '实付金额' : '实收金额'}
        </FieldTitle>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value.actualAmount}
          onChange={(e) => updateField('actualAmount', e.target.value)}
          placeholder={
            order.orderType === 'Purchase' ? '请输入实付金额' : '请输入实收金额'
          }
        />
        <p className="text-xs text-muted-foreground">
          {order.orderType === 'Purchase'
            ? '可修改实付金额（支持抹零/让利），默认等于应付金额。'
            : '可修改实收金额（支持抹零/让利），默认等于应收金额。'}
        </p>
        {errors.actualAmount && <FieldError>{errors.actualAmount}</FieldError>}
      </Field>

      {/* 结算预览 */}
      {preview && preview.categoryGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            记账预览
            {previewLoading && '（加载中...）'}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>品类</TableHead>
                <TableHead className="text-right">记账金额</TableHead>
                <TableHead>目标账本</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.categoryGroups.map((group) => (
                <TableRow key={group.categoryId}>
                  <TableCell className="font-medium">
                    {group.categoryName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(group.amount)}
                  </TableCell>
                  <TableCell>{group.bookName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 折扣冲账预览 */}
          {hasDiscount &&
            preview.writeOffPreview &&
            preview.writeOffPreview.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  折扣冲账（抹零/让利{' '}
                  {formatCurrency(Math.abs(preview.discountAmount ?? 0))}）
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>品类</TableHead>
                      <TableHead className="text-right">冲账金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.writeOffPreview.map((wo) => (
                      <TableRow key={`wo-${wo.categoryId}`}>
                        <TableCell className="font-medium">
                          {wo.categoryName}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatCurrency(wo.writeOffAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

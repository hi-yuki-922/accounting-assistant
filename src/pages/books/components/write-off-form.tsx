/**
 * 冲账表单组件
 * 从 WriteOffDialog 中抽取的受控表单，负责展示原始记录信息与冲账字段编辑
 */

import { useMemo } from 'react'

import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { ACCOUNTING_CHANNEL_DISPLAY_TEXT } from '@/api/commands/accounting/enums'
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
import { formatRawAmount } from '@/lib/formatters'
import { cn } from '@/lib/utils'

/** 冲账表单数据 */
type WriteOffFormData = {
  writeOffAmount: string
  channel: string
  remark: string
}

/** 冲账表单 Props */
type WriteOffFormProps = {
  value: WriteOffFormData
  onChange: (data: WriteOffFormData) => void
  record: RecordWithCountDto
  errors?: Record<string, string>
}

/**
 * 校验冲账表单数据
 * @param data 表单数据
 * @param netAmount 当前可冲账净金额
 * @returns 字段错误映射，空对象表示校验通过
 */
const validateWriteOffForm = (
  data: WriteOffFormData,
  netAmount: number
): Record<string, string> => {
  const errors: Record<string, string> = {}
  const writeOffNum = Number.parseFloat(data.writeOffAmount)

  if (!data.writeOffAmount || Number.isNaN(writeOffNum)) {
    errors.writeOffAmount = '请输入有效的冲账金额'
  }

  // 冲账后净金额 = 当前净金额 + 冲账金额，不能小于 0
  if (!errors.writeOffAmount && netAmount + writeOffNum < 0) {
    errors.writeOffAmount = '冲账后净金额不能小于 0'
  }

  return errors
}

/**
 * 根据原始记录生成默认表单数据
 * @param record 原始记账记录
 * @returns 默认表单数据
 */
const getDefaultWriteOffFormData = (
  record: RecordWithCountDto
): WriteOffFormData => ({
  writeOffAmount: '',
  channel: record.channel,
  remark: '',
})

export const WriteOffForm = ({
  value,
  onChange,
  record,
  errors = {},
}: WriteOffFormProps) => {
  // 实时计算冲账后净金额：当前可冲账金额 + 本次冲账金额
  const netAmount = useMemo(() => {
    const writeOffNum = Number.parseFloat(value.writeOffAmount) || 0
    return record.netAmount + writeOffNum
  }, [record.netAmount, value.writeOffAmount])

  const isNetAmountInvalid = netAmount < 0

  return (
    <div className="space-y-4 py-4">
      {/* 原始记录信息 */}
      <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">标题</span>
          <span className="font-medium">{record.title}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">原始金额</span>
          <span className="font-medium">
            {formatRawAmount(record.originalAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">可冲账金额</span>
          <span className="font-medium">
            {formatRawAmount(record.netAmount)}
          </span>
        </div>
      </div>

      {/* 冲账金额 */}
      <Field data-invalid={!!errors.writeOffAmount}>
        <FieldTitle>
          冲账金额 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          type="number"
          step={0.01}
          value={value.writeOffAmount}
          onChange={(e) =>
            onChange({ ...value, writeOffAmount: e.target.value })
          }
          placeholder="请输入冲账金额（支持正负数）"
        />
        {errors.writeOffAmount && (
          <FieldError>{errors.writeOffAmount}</FieldError>
        )}
      </Field>

      {/* 净金额实时显示 */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">冲账后净金额</span>
          <span
            className={cn(
              'font-medium',
              isNetAmountInvalid
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            )}
          >
            {formatRawAmount(netAmount)}
          </span>
        </div>
        {isNetAmountInvalid && (
          <p className="text-xs text-destructive">冲账后净金额不能小于 0</p>
        )}
      </div>

      {/* 渠道 */}
      <Field>
        <FieldTitle>渠道</FieldTitle>
        <Select
          value={value.channel}
          onValueChange={(val) => onChange({ ...value, channel: val })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择渠道" />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(ACCOUNTING_CHANNEL_DISPLAY_TEXT) as [
                string,
                string,
              ][]
            ).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* 备注 */}
      <Field>
        <FieldTitle>备注</FieldTitle>
        <Textarea
          value={value.remark}
          onChange={(e) => onChange({ ...value, remark: e.target.value })}
          placeholder="请输入备注（可选）"
          rows={3}
        />
      </Field>
    </div>
  )
}

export { validateWriteOffForm, getDefaultWriteOffFormData }
export type { WriteOffFormData, WriteOffFormProps }

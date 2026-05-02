/**
 * 记账记录表单组件
 * 支持创建和编辑两种模式
 * 封装表单字段、校验和数据转换逻辑
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import {
  AccountingType,
  AccountingChannel,
  ACCOUNTING_TYPE_DISPLAY_TEXT,
  ACCOUNTING_CHANNEL_DISPLAY_TEXT,
} from '@/api/commands/accounting/enums'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/** 表单数据类型 */
export type RecordFormData = {
  title: string
  amount: string
  accountingType: string
  channel: string
  date: Date
  time: string
  remark: string
}

export type RecordFormProps = {
  /** 'create' 时类型可编辑，'edit' 时类型只读 */
  mode: 'create' | 'edit'
  /** 编辑模式下的原始记录（用于只读显示类型） */
  record?: RecordWithCountDto
  /** 表单数据（受控模式） */
  value: RecordFormData
  /** 数据变更回调 */
  onChange: (data: RecordFormData) => void
  /** 校验错误 */
  errors?: Record<string, string>
}

/** 获取当前时间的 HH:mm 格式字符串 */
export const getCurrentTime = (): string => format(new Date(), 'HH:mm')

/** 获取创建模式的默认表单数据 */
export const getDefaultRecordFormData = (): RecordFormData => ({
  title: '',
  amount: '',
  accountingType: AccountingType.Expenditure,
  channel: AccountingChannel.Unknown,
  date: new Date(),
  time: getCurrentTime(),
  remark: '',
})

/** 从已有记录构造编辑模式的表单数据 */
export const getRecordFormDataFromRecord = (
  record: RecordWithCountDto
): RecordFormData => {
  const recordDate = new Date(record.recordTime)
  return {
    title: record.title,
    amount: String(record.amount),
    accountingType: record.accountingType,
    channel: record.channel,
    date: recordDate,
    time: format(recordDate, 'HH:mm'),
    remark: record.remark || '',
  }
}

/** 校验表单数据 */
export const validateRecordForm = (
  data: RecordFormData
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (!data.title.trim()) {
    errors.title = '请输入标题'
  }
  const amountNum = Number.parseFloat(data.amount)
  if (!amountNum || amountNum <= 0) {
    errors.amount = '金额必须大于 0'
  }
  return errors
}

/** 将日期和时间组合为后端所需的格式 "YYYY-MM-DD HH:mm:ss" */
export const formatRecordTime = (date: Date, time: string): string =>
  `${format(date, 'yyyy-MM-dd')} ${time}:00`

/**
 * 记账记录表单组件
 * 纯表单渲染，不包含 Dialog 外壳
 */
export const RecordForm = ({
  mode,
  record,
  value,
  onChange,
  errors = {},
}: RecordFormProps) => {
  const updateField = <K extends keyof RecordFormData>(
    field: K,
    val: RecordFormData[K]
  ) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-4 py-4">
      {/* 标题 */}
      <Field orientation="vertical">
        <FieldTitle>
          标题 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="请输入标题"
          className={errors.title ? 'border-destructive' : ''}
        />
        <FieldError>{errors.title}</FieldError>
      </Field>

      {/* 金额 */}
      <Field orientation="vertical">
        <FieldTitle>
          金额 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          type="number"
          min={0.01}
          step={0.01}
          value={value.amount}
          onChange={(e) => updateField('amount', e.target.value)}
          placeholder="请输入金额"
          className={errors.amount ? 'border-destructive' : ''}
        />
        <FieldError>{errors.amount}</FieldError>
      </Field>

      {/* 类型：创建时可编辑，编辑时只读 */}
      <Field orientation="vertical">
        <FieldTitle>类型</FieldTitle>
        {mode === 'create' ? (
          <Select
            value={value.accountingType}
            onValueChange={(val) => updateField('accountingType', val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AccountingType.Income}>
                {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.Income]}
              </SelectItem>
              <SelectItem value={AccountingType.Expenditure}>
                {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.Expenditure]}
              </SelectItem>
              <SelectItem value={AccountingType.InvestmentIncome}>
                {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.InvestmentIncome]}
              </SelectItem>
              <SelectItem value={AccountingType.InvestmentLoss}>
                {ACCOUNTING_TYPE_DISPLAY_TEXT[AccountingType.InvestmentLoss]}
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-8 flex items-center text-sm text-muted-foreground border rounded-lg px-2.5 bg-muted/50">
            {record
              ? ACCOUNTING_TYPE_DISPLAY_TEXT[
                  record.accountingType as keyof typeof ACCOUNTING_TYPE_DISPLAY_TEXT
                ] || record.accountingType
              : value.accountingType}
          </div>
        )}
      </Field>

      {/* 渠道 */}
      <Field orientation="vertical">
        <FieldTitle>渠道</FieldTitle>
        <Select
          value={value.channel}
          onValueChange={(val) => updateField('channel', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择渠道" />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.keys(
                ACCOUNTING_CHANNEL_DISPLAY_TEXT
              ) as (keyof typeof ACCOUNTING_CHANNEL_DISPLAY_TEXT)[]
            ).map((key) => (
              <SelectItem key={key} value={key}>
                {ACCOUNTING_CHANNEL_DISPLAY_TEXT[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* 日期选择 */}
      <Field orientation="vertical">
        <FieldTitle>日期</FieldTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value.date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.date ? (
                format(value.date, 'yyyy-MM-dd')
              ) : (
                <span>选择日期</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={zhCN}
              mode="single"
              selected={value.date}
              onSelect={(selected) => selected && updateField('date', selected)}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </Field>

      {/* 时间 */}
      <Field orientation="vertical">
        <FieldTitle>时间</FieldTitle>
        <Input
          type="time"
          value={value.time}
          onChange={(e) => updateField('time', e.target.value)}
        />
      </Field>

      {/* 备注 */}
      <Field orientation="vertical">
        <FieldTitle>备注</FieldTitle>
        <Textarea
          value={value.remark}
          onChange={(e) => updateField('remark', e.target.value)}
          placeholder="请输入备注（可选）"
          rows={3}
        />
      </Field>
    </div>
  )
}

/**
 * 写入工具必填字段映射表
 * 供 MissingFieldsForm 使用，定义每个写入工具的必填字段及其表单元素
 */

/**
 * 字段定义
 */
export type FieldDef = {
  /** 字段中文标签 */
  label: string
  /** 字段类型 */
  type: 'text' | 'number' | 'select' | 'datetime'
  /** select 类型的选项 */
  options?: { label: string; value: string }[]
}

/**
 * 支付渠道选项
 */
const CHANNEL_OPTIONS: { label: string; value: string }[] = [
  { label: '现金', value: 'Cash' },
  { label: '支付宝', value: 'AliPay' },
  { label: '微信', value: 'Wechat' },
  { label: '银行卡', value: 'BankCard' },
]

/**
 * 记账类型选项
 */
const ACCOUNTING_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: '收入', value: 'Income' },
  { label: '支出', value: 'Expenditure' },
  { label: '投资收益', value: 'InvestmentIncome' },
  { label: '投资亏损', value: 'InvestmentLoss' },
]

/**
 * 订单类型选项
 */
const ORDER_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: '销售', value: 'Sales' },
  { label: '采购', value: 'Purchase' },
]

/**
 * 写入工具必填字段映射表
 * 仅包含每个工具的必填字段
 */
export const writeToolFieldMap: Record<string, Record<string, FieldDef>> = {
  create_order: {
    orderType: {
      label: '订单类型',
      type: 'select',
      options: ORDER_TYPE_OPTIONS,
    },
  },
  settle_order: {
    orderId: { label: '订单 ID', type: 'number' },
    channel: {
      label: '支付渠道',
      type: 'select',
      options: CHANNEL_OPTIONS,
    },
  },
  create_record: {
    title: { label: '摘要', type: 'text' },
    amount: { label: '金额', type: 'number' },
    accountingType: {
      label: '记账类型',
      type: 'select',
      options: ACCOUNTING_TYPE_OPTIONS,
    },
    channel: {
      label: '支付渠道',
      type: 'select',
      options: CHANNEL_OPTIONS,
    },
    recordTime: { label: '记账时间', type: 'datetime' },
  },
  update_record: {
    id: { label: '记录 ID', type: 'number' },
  },
  create_write_off: {
    originalRecordId: { label: '原始记录 ID', type: 'number' },
    amount: { label: '冲账金额', type: 'number' },
  },
}

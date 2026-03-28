/**
 * Accounting 模块枚举定义
 * 与 Rust 后端 src-tauri/src/enums/accounting.rs 中的枚举定义对齐
 */

/**
 * 记账类型枚举
 * 与 Rust 后端 AccountingType 枚举对齐
 */
export const AccountingType = {
  Income: 'Income',
  Expenditure: 'Expenditure',
  InvestmentIncome: 'InvestmentIncome',
  InvestmentLoss: 'InvestmentLoss',
} as const

export type AccountingType =
  (typeof AccountingType)[keyof typeof AccountingType]

/**
 * 记账渠道枚举
 * 与 Rust 后端 AccountingChannel 枚举对齐
 */
export const AccountingChannel = {
  Cash: 'Cash',
  AliPay: 'AliPay',
  Wechat: 'Wechat',
  BankCard: 'BankCard',
  Unknown: 'Unknown',
} as const

export type AccountingChannel =
  (typeof AccountingChannel)[keyof typeof AccountingChannel]

/**
 * 记账记录状态枚举
 * 与 Rust 后端 AccountingRecordState 枚举对齐
 */
export const AccountingRecordState = {
  PendingPosting: 'PendingPosting',
  Posted: 'Posted',
} as const

export type AccountingRecordState =
  (typeof AccountingRecordState)[keyof typeof AccountingRecordState]

/**
 * 枚举显示文本映射
 * 用于前端显示，将英文枚举值映射为中文显示文本
 */

/**
 * 记账类型显示文本映射
 */
export const ACCOUNTING_TYPE_DISPLAY_TEXT = {
  [AccountingType.Income]: '收入',
  [AccountingType.Expenditure]: '支出',
  [AccountingType.InvestmentIncome]: '投资收益',
  [AccountingType.InvestmentLoss]: '投资亏损',
} as const

/**
 * 记账渠道显示文本映射
 */
export const ACCOUNTING_CHANNEL_DISPLAY_TEXT = {
  [AccountingChannel.Cash]: '现金',
  [AccountingChannel.AliPay]: '支付宝',
  [AccountingChannel.Wechat]: '微信',
  [AccountingChannel.BankCard]: '银行卡',
  [AccountingChannel.Unknown]: '未知',
} as const

/**
 * 记账记录状态显示文本映射
 */
export const ACCOUNTING_RECORD_STATE_DISPLAY_TEXT = {
  [AccountingRecordState.PendingPosting]: '待入账',
  [AccountingRecordState.Posted]: '已入账',
} as const

/**
 * Accounting 模块枚举定义
 * 与 Rust 后端 src-tauri/src/enums/accounting.rs 中的枚举定义对齐
 */

/**
 * 记账类型枚举
 * 与 Rust 后端 AccountingType 枚举对齐
 */
export enum AccountingType {
  Income = '收入',
  Expenditure = '支出',
  InvestmentIncome = '投资收益',
  InvestmentLoss = '投资亏损',
}

/**
 * 记账渠道枚举
 * 与 Rust 后端 AccountingChannel 枚举对齐
 */
export enum AccountingChannel {
  Cash = '现金',
  AliPay = '支付宝',
  Wechat = '微信',
  BankCard = '银行卡',
  Unknown = '未知',
}

/**
 * 记账记录状态枚举
 * 与 Rust 后端 AccountingRecordState 枚举对齐
 */
export enum AccountingRecordState {
  PendingPosting = '待入账',
  Posted = '已入账',
}

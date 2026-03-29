/**
 * Accounting 模块类型定义
 * 与 Rust 后端类型定义对齐
 */

import type {
  AccountingType,
  AccountingChannel,
  AccountingRecordState,
} from './enums'

/**
 * 金额类型使用 number（前端显示用）
 * 注意：实际 Rust 后端使用 rust_decimal::Decimal
 */
export type Amount = number

/**
 * 记账记录模型
 * 与 Rust 后端 accounting_record::Model 对齐
 */
export type AccountingRecord = {
  id: number
  amount: Amount
  recordTime: string
  accountingType: AccountingType
  title: string
  channel: AccountingChannel
  remark?: string
  writeOffId?: number
  createdAt: string
  state: AccountingRecordState
  bookId?: number
}

/**
 * 添加记账记录 DTO
 * 与 Rust 后端 AddAccountingRecordDto 对齐
 */
export type AddAccountingRecordDto = {
  amount: number
  // Format: "YYYY-MM-DD HH:mm:ss"
  recordTime: string
  accountingType: string
  title: string
  channel: string
  remark?: string
  writeOffId?: number
  bookId?: number
}

/**
 * 修改记账记录 DTO
 * 与 Rust 后端 ModifyAccountingRecordDto 对齐
 */
export type ModifyAccountingRecordDto = {
  id: number
  amount?: number
  recordTime?: string
  accountingType?: string
  title?: string
  remark?: string | null
}

/**
 * 过账记账记录 DTO
 */
export type PostAccountingRecordDto = {
  id: number
}

/**
 * 分页结果
 */
export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 创建冲账记录 DTO
 * 与 Rust 后端 CreateWriteOffRecordDto 对齐
 */
export type CreateWriteOffRecordDto = {
  /** 被冲账的原始记录 ID */
  originalRecordId: number
  /** 冲账金额（支持正负数） */
  amount: number
  /** 渠道（可选，默认继承原始记录渠道） */
  channel?: string
  /** 备注 */
  remark?: string
  /** 记录时间（可选，默认当前时间，格式 "YYYY-MM-DD HH:mm:ss"） */
  recordTime?: string
}

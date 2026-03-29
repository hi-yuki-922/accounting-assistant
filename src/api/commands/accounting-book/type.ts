import type { AccountingRecord } from '../accounting'

/**
 * Accounting-Book 模块类型定义
 * 与 Rust 后端类型定义对齐
 */

/** 默认账本 ID（未归类账目）*/
export const DEFAULT_BOOK_ID = 10_000_001

/**
 * 账本模型
 * 与 Rust 后端 accounting_book::Model 对齐
 */
export type AccountingBook = {
  id: number
  title: string
  description?: string
  createdAt: string
  recordCount: number
  icon?: string
}

/**
 * 创建账本 DTO
 * 与 Rust 后端 CreateBookDto 对齐
 */
export type CreateBookDto = {
  title: string
  description?: string
  icon?: string
}

/**
 * 更新账本 DTO
 * 与 Rust 后端 UpdateBookDto 对齐
 */
export type UpdateBookDto = {
  id: number
  title?: string
  description?: string | null
  icon?: string | null
}

/**
 * 更新账本标题 DTO（已弃用，请使用 UpdateBookDto）
 * 与 Rust 后端 UpdateBookTitleDto 对齐
 */
export type UpdateBookTitleDto = {
  id: number
  title: string
}

/**
 * 分页查询 DTO
 * 与 Rust 后端 GetBooksPaginatedDto 对齐
 */
export type GetBooksPaginatedDto = {
  page: number
  pageSize: number
}

/**
 * 冲账记录简要信息
 * 与 Rust 后端 WriteOffRecordDto 对齐
 */
export type WriteOffRecord = {
  id: number
  amount: number
  recordTime: string
  remark?: string
  channel: string
}

/**
 * 冲账详情（HoverCard 按需加载）
 * 与 Rust 后端 RecordWriteOffDetailsDto 对齐
 */
export type RecordWriteOffDetails = {
  originalAmount: number
  writeOffRecords: WriteOffRecord[]
}

/**
 * 记录数量 DTO
 * 与 Rust 后端 RecordWithCountDto 对齐
 * 注意：后端使用了 #[serde(flatten)]，所以 AccountingRecord 的字段会被平铺到外层
 */
export type RecordWithCountDto = AccountingRecord & {
  relatedCount: number
  /** 原始金额（冲账前） */
  originalAmount: number
  /** 净金额（原始金额 + 冲账金额合计） */
  netAmount: number
}

/**
 * 根据账本 ID 查询记录 DTO
 */
export type GetRecordsByBookIdPaginatedDto = {
  bookId: number
  page: number
  pageSize: number
  startTime?: string
  endTime?: string
  accountingType?: string
  channel?: string
  state?: string
}

/**
 * 账本统计信息
 */
export type BookStats = {
  bookId: number
  bookTitle: string
  totalRecords: number
  totalIncome: number
  totalExpenditure: number
  balance: number
}

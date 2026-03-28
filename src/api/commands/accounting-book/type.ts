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
  create_at: string
  record_count: number
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
  page_size: number
}

/**
 * 记录数量 DTO
 * 与 Rust 后端 RecordWithCountDto 对齐
 * 注意：后端使用了 #[serde(flatten)]，所以 AccountingRecord 的字段会被平铺到外层
 */
export type RecordWithCountDto = AccountingRecord & {
  related_count: number
}

/**
 * 根据账本 ID 查询记录 DTO
 */
export type GetRecordsByBookIdPaginatedDto = {
  book_id: number
  page: number
  page_size: number
  start_time?: string
  end_time?: string
  accounting_type?: string
  channel?: string
  state?: string
}

/**
 * 账本统计信息
 */
export type BookStats = {
  book_id: number
  book_title: string
  total_records: number
  total_income: number
  total_expenditure: number
  balance: number
}

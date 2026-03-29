/**
 * Accounting-Book 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/accounting_book.rs 中的命令对齐
 */

import type { InvokeArgs } from '@tauri-apps/api/core'

import type { PaginatedResponse } from '@/api/shared/types.ts'
import { tryCMD } from '@/lib'

import type {
  AccountingBook,
  CreateBookDto,
  UpdateBookTitleDto,
  UpdateBookDto,
  GetBooksPaginatedDto,
  RecordWithCountDto,
  GetRecordsByBookIdPaginatedDto,
  BookStats,
  RecordWriteOffDetails,
} from './type'

// 导出类型
export * from './type'

/**
 * 创建账本
 * 对应 Rust 后端 create_book 命令
 */
export const createBook = (data: CreateBookDto) =>
  tryCMD<AccountingBook>('create_book', { input: data })

/**
 * 查询所有账本
 * 对应 Rust 后端 get_books 命令
 */
export const getBooks = () => tryCMD<AccountingBook[]>('get_books')

/**
 * 根据 ID 查询单个账本
 * 对应 Rust 后端 get_book_by_id 命令
 */
export const getBookById = (id: number) =>
  tryCMD<AccountingBook | null>('get_book_by_id', { id })

/**
 * 分页查询账本
 * 对应 Rust 后端 get_books_paginated 命令
 */
export const getBooksPaginated = (params: GetBooksPaginatedDto) =>
  tryCMD<PaginatedResponse<AccountingBook>>('get_books_paginated', {
    input: params,
  } as InvokeArgs)

/**
 * 更新账本信息
 * 对应 Rust 后端 update_book 命令
 */
export const updateBook = (data: UpdateBookDto) =>
  tryCMD<AccountingBook | null>('update_book', { input: data })

/**
 * 修改账本标题（已弃用，请使用 updateBook）
 * 对应 Rust 后端 update_book_title 命令
 */
export const updateBookTitle = (data: UpdateBookTitleDto) =>
  tryCMD<AccountingBook | null>('update_book_title', { input: data })

/**
 * 删除账本
 * 对应 Rust 后端 delete_book 命令
 */
export const deleteBook = (id: number) => tryCMD<boolean>('delete_book', { id })

/**
 * 根据账本 ID 分页查询记录
 * 对应 Rust 后端 get_records_by_book_id_paginated 命令
 */
export const getRecordsByBookIdPaginated = (
  params: GetRecordsByBookIdPaginatedDto
) =>
  tryCMD<PaginatedResponse<RecordWithCountDto>>(
    'get_records_by_book_id_paginated',
    { input: params } as InvokeArgs
  )

/**
 * 获取账本统计信息
 * 对应 Rust 后端 get_book_stats 命令
 */
export const getBookStats = (bookId: number) =>
  tryCMD<BookStats>('get_book_stats', { bookId })

/**
 * 获取所有账本的统计信息
 */
export const getAllBooksStats = () => tryCMD<BookStats[]>('get_all_books_stats')

/**
 * 查询记录的冲账详情（HoverCard 按需加载）
 * 对应 Rust 后端 get_record_write_off_details 命令
 */
export const getRecordWriteOffDetails = (recordId: number) =>
  tryCMD<RecordWriteOffDetails>('get_record_write_off_details', { recordId })

// 便捷方法
export const accountingBook = {
  create: createBook,
  delete: deleteBook,
  getAll: getBooks,
  getAllStats: getAllBooksStats,
  getById: getBookById,
  getPaginated: getBooksPaginated,
  getRecordWriteOffDetails,
  getRecordsByBookId: getRecordsByBookIdPaginated,
  getStats: getBookStats,
  update: updateBook,
  updateTitle: updateBookTitle,
}

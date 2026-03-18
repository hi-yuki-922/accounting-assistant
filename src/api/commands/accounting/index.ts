/**
 * Accounting 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/accounting.rs 中的命令对齐
 */
import type { InvokeArgs } from "@tauri-apps/api/core";

import { tryCMD } from '@/lib'

import {
  AccountingType,
  AccountingChannel,
  AccountingRecordState,
} from './enums'
import type {
  AccountingRecord,
  AddAccountingRecordDto,
  ModifyAccountingRecordDto,
  PostAccountingRecordDto,
  QueryAccountingRecordsParams,
  PaginatedResult,
} from './type'

// 导出类型和枚举
export * from './type'

export * from './enums'

/**
 * 添加记账记录（别名 add_accounting_record）
 * 对应 Rust 后端 add_accounting_record 命令
 * 注意：前端使用 snake_case 命名，后端使用 snake_case 命名
 */
export const addAccountingRecord = (data: AddAccountingRecordDto) =>
  tryCMD<AccountingRecord>('add_accounting_record', { input: data })

/**
 * 修改记账记录（别名 modify_accounting_record）
 * 对应 Rust 后端 modify_accounting_record 命令
 */
export const modifyAccountingRecord = (data: ModifyAccountingRecordDto) =>
  tryCMD<AccountingRecord>('modify_accounting_record', { input: data })

/**
 * 过账记账记录（别名 post_accounting_record）
 * 对应 Rust 后端 post_accounting_record 命令
 */
export const postAccountingRecord = (data: PostAccountingRecordDto) =>
  tryCMD<AccountingRecord>('post_accounting_record', data)

/**
 * 查询记账记录（新增功能，前端扩展）
 * 对应 Rust 后端的查询逻辑
 */
export const queryAccountingRecords = (
  params: QueryAccountingRecordsParams = {}
) =>
  tryCMD<PaginatedResult<AccountingRecord>>('query_accounting_records', params as InvokeArgs)

/**
 * 获取记账记录（通过 ID）
 */
export const getAccountingRecord = (id: number) =>
  tryCMD<AccountingRecord | null>('get_accounting_record', { id })

/**
 * 删除记账记录（新增功能）
 */
export const deleteAccountingRecord = (id: number) =>
  tryCMD<boolean>('delete_accounting_record', { id })

/**
 * 获取记账记录统计
 */
export const getAccountingStats = (
  params: {
    book_id?: number
    start_time?: string
    end_time?: string
  } = {}
) => tryCMD<any>('get_accounting_stats', params)

// 便捷方法
export const accounting = {
  AccountingChannel,
  AccountingRecordState,
  AccountingType,
  add: addAccountingRecord,
  delete: deleteAccountingRecord,
  get: getAccountingRecord,
  modify: modifyAccountingRecord,
  post: postAccountingRecord,
  query: queryAccountingRecords,
  stats: getAccountingStats,
}

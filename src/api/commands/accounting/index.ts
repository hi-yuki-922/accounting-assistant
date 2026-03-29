/**
 * Accounting 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/accounting.rs 中的命令对齐
 */
import type { InvokeArgs } from '@tauri-apps/api/core'

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
  CreateWriteOffRecordDto,
} from './type'

// 导出类型和枚举
export * from './type'

export * from './enums'

/**
 * 添加记账记录
 * 对应 Rust 后端 add_accounting_record 命令
 */
export const addAccountingRecord = (data: AddAccountingRecordDto) =>
  tryCMD<AccountingRecord>('add_accounting_record', { input: data })

/**
 * 修改记账记录
 * 对应 Rust 后端 modify_accounting_record 命令
 */
export const modifyAccountingRecord = (data: ModifyAccountingRecordDto) =>
  tryCMD<AccountingRecord>('modify_accounting_record', { input: data })

/**
 * 过账记账记录
 * 对应 Rust 后端 post_accounting_record 命令
 */
export const postAccountingRecord = (data: PostAccountingRecordDto) =>
  tryCMD<AccountingRecord>('post_accounting_record', data)

/**
 * 获取记账记录（通过 ID）
 */
export const getAccountingRecord = (id: number) =>
  tryCMD<AccountingRecord | null>('get_accounting_record', { id })

/**
 * 删除记账记录（仅限待入账记录）
 * 对应 Rust 后端 delete_accounting_record 命令
 */
export const deleteAccountingRecord = (id: number) =>
  tryCMD<boolean>('delete_accounting_record', { id })

/**
 * 批量入账
 * 对应 Rust 后端 batch_post_accounting_records 命令
 */
export const batchPostAccountingRecords = (recordIds: number[]) =>
  tryCMD<AccountingRecord[]>('batch_post_accounting_records', {
    input: { recordIds },
  })

/**
 * 创建冲账记录
 * 对应 Rust 后端 create_write_off_record 命令
 */
export const createWriteOffRecord = (data: CreateWriteOffRecordDto) =>
  tryCMD<AccountingRecord>('create_write_off_record', { input: data })

// 便捷方法
export const accounting = {
  AccountingChannel,
  AccountingRecordState,
  AccountingType,
  add: addAccountingRecord,
  batchPost: batchPostAccountingRecords,
  createWriteOff: createWriteOffRecord,
  delete: deleteAccountingRecord,
  get: getAccountingRecord,
  modify: modifyAccountingRecord,
  post: postAccountingRecord,
}

/**
 * Attachment 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/attachment.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type {
  AttachmentInfo,
  CreateAttachmentDto,
  QueryAttachmentsParams,
} from './type'
import type { PaginatedResponse } from "@/api/shared/types.ts";

// 导出类型
export type * from './type'

/**
 * 创建附件
 * 对应 Rust 后端 create_attachment 命令
 */
export const createAttachment = (data: CreateAttachmentDto) =>
  tryCMD<[number, string]>('create_attachment', data)

/**
 * 按 ID 删除附件
 * 对应 Rust 后端 delete_attachment 命令
 */
export const deleteAttachment = (id: number) =>
  tryCMD('delete_attachment', { id })

/**
 * 按路径删除附件
 * 对应 Rust 后端 delete_attachment_by_path 命令
 */
export const deleteAttachmentByPath = (path: string) =>
  tryCMD('delete_attachment_by_path', { path })

/**
 * 查询附件列表
 * 对应 Rust 后端 query_attachments 命令
 */
export const queryAttachments = (params: QueryAttachmentsParams = {}) =>
  tryCMD<PaginatedResponse<AttachmentInfo>>('query_attachments', params)

/**
 * 按主键 ID 查询附件
 * 对应 Rust 后端 get_attachment_by_master_id 命令
 */
export const getAttachmentByMasterId = (master_id: number) =>
  tryCMD<AttachmentInfo[]>('get_attachment_by_master_id', { master_id })

/**
 * 按 ID 查询单个附件
 * 对应 Rust 后端 get_attachment_by_id 命令
 */
export const getAttachmentById = (id: number) =>
  tryCMD<AttachmentInfo | null>('get_attachment_by_id', { id })

/**
 * 获取附件访问路径
 * 对应 Rust 后端 get_attachment_access_path 命令
 */
export const getAttachmentAccessPath = (id: number) =>
  tryCMD<string>('get_attachment_access_path', { id })

/**
 * 获取附件下载 URL
 * 对应 Rust 后端 get_attachment_download_url 命令
 */
export const getAttachmentDownloadUrl = (id: number) =>
  tryCMD<string>('get_attachment_download_url', { id })

// 便捷方法
export const attachment = {
  create: createAttachment,
  delete: deleteAttachment,
  deleteByPath: deleteAttachmentByPath,
  getAccessPath: getAttachmentAccessPath,
  getById: getAttachmentById,
  getByMasterId: getAttachmentByMasterId,
  getDownloadUrl: getAttachmentDownloadUrl,
  query: queryAttachments,
}

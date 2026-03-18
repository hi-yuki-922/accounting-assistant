/**
 * Attachment 模块类型定义
 * 与 Rust 后端类型定义对齐
 */

/**
 * 附件信息
 * 与 Rust 后端 AttachmentInfo 对齐
 */
export type AttachmentInfo = {
  id: number
  file_name: string
  file_suffix: string
  file_size: string
  file_path: string
  create_at: string
  master_id: number
}

/**
 * 创建附件 DTO
 * 与 Rust 后端创建附件参数对齐
 */
export type CreateAttachmentDto = {
  master_id: number
  file_name: string
  file_suffix: string
  file_size: string
  file_content: ArrayBuffer
}

/**
 * 查询附件参数
 * 与 Rust 后端 query_attachments 参数对齐
 */
export type QueryAttachmentsParams = {
  page?: number
  page_size?: number
  file_name?: string
  file_suffix?: string
  start_time?: string
  end_time?: string
}

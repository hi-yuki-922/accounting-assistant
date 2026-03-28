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
  fileName: string
  fileSuffix: string
  fileSize: string
  filePath: string
  createdAt: string
  masterId: number
}

/**
 * 创建附件 DTO
 * 与 Rust 后端创建附件参数对齐
 */
export type CreateAttachmentDto = {
  masterId: number
  fileName: string
  fileSuffix: string
  fileSize: string
  fileContent: ArrayBuffer
}

/**
 * 查询附件参数
 * 与 Rust 后端 query_attachments 参数对齐
 */
export type QueryAttachmentsParams = {
  page?: number
  pageSize?: number
  fileName?: string
  fileSuffix?: string
  startTime?: string
  endTime?: string
}

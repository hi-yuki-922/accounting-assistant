/**
 * Agent 相关类型定义
 */

/**
 * 工具执行结果
 */
export type ToolResult<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * 查询记账记录参数
 */
export type QueryRecordsParams = {
  start_time?: string
  end_time?: string
  accounting_type?: string
  min_amount?: number
  max_amount?: number
  book_id?: number
  page?: number
  page_size?: number
}

/**
 * 添加记账记录参数
 */
export type AddRecordParams = {
  title: string
  amount: number
  accounting_type: string
  channel: string
  record_time: string
  remark?: string
  book_id?: number
}

/**
 * 获取统计信息参数
 */
export type StatisticsParams = {
  book_id?: number
  start_time?: string
  end_time?: string
}

/**
 * 创建账本参数
 */
export type CreateBookParams = {
  title: string
  description?: string
}

/**
 * 查询附件参数
 */
export type QueryAttachmentsParams = {
  page?: number
  page_size?: number
  file_name?: string
  file_suffix?: string
  start_time?: string
  end_time?: string
}

/**
 * 按主键 ID 查询附件参数
 */
export type GetAttachmentsByMasterIdParams = {
  master_id: number
}

/**
 * AI 模块共享类型定义
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

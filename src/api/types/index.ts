/**
 * API 内部使用的类型定义
 */

export interface APIError {
  code: string
  message: string
  details?: any
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * API 响应的统一格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  message?: string
}

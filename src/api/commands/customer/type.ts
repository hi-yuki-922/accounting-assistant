/**
 * Customer 模块类型定义
 * 与 Rust 后端 customer::Model / DTO 对齐
 */

/**
 * 客户分类枚举
 * 与 Rust 后端 CustomerCategory 对齐
 */
export type CustomerCategory = 'Retailer' | 'Supplier'

/** 客户分类中文显示文本 */
export const CUSTOMER_CATEGORY_LABELS: Record<CustomerCategory, string> = {
  Retailer: '零售商',
  Supplier: '供应商',
} as const

/**
 * 客户模型
 * 与 Rust 后端 customer::Model 对齐
 */
export type Customer = {
  id: number
  name: string
  category: CustomerCategory
  phone: string
  wechat?: string
  address?: string
  bankAccount?: string
  remark?: string
  createAt: string
}

/**
 * 创建客户 DTO
 * 与 Rust 后端 CreateCustomerDto 对齐
 */
export type CreateCustomerDto = {
  name: string
  category: CustomerCategory
  phone: string
  wechat?: string
  address?: string
  bankAccount?: string
  remark?: string
}

/**
 * 修改客户 DTO
 * 与 Rust 后端 UpdateCustomerDto 对齐
 */
export type UpdateCustomerDto = {
  id: number
  name?: string
  category?: CustomerCategory
  phone?: string
  wechat?: string | null
  address?: string | null
  bankAccount?: string | null
  remark?: string | null
}

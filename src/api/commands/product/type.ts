/**
 * Product 模块类型定义
 * 与 Rust 后端 product::Model / DTO 对齐
 */

/**
 * 商品模型
 * 与 Rust 后端 product::Model 对齐
 */
export type Product = {
  id: number
  name: string
  categoryId?: number
  category?: string
  unit: string
  defaultSellPrice?: number
  defaultPurchasePrice?: number
  sku?: string
  keywords?: string
  remark?: string
  createAt: string
}

/**
 * 创建商品 DTO
 * 与 Rust 后端 CreateProductDto 对齐
 */
export type CreateProductDto = {
  name: string
  categoryId?: number
  category?: string
  unit: string
  defaultSellPrice?: number
  defaultPurchasePrice?: number
  sku?: string
  keywords?: string
  remark?: string
}

/**
 * 修改商品 DTO
 * 与 Rust 后端 UpdateProductDto 对齐
 */
export type UpdateProductDto = {
  id: number
  categoryId?: number | null
  category?: string | null
  name?: string
  unit?: string
  defaultSellPrice?: number | null
  defaultPurchasePrice?: number | null
  sku?: string | null
  keywords?: string | null
  remark?: string | null
}

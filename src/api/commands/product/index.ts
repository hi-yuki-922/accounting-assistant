/**
 * Product 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/product.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type { Product, CreateProductDto, UpdateProductDto } from './type'

// 导出类型
export * from './type'

/**
 * 创建商品
 * 对应 Rust 后端 create_product 命令
 */
export const createProduct = (data: CreateProductDto) =>
  tryCMD<Product>('create_product', { input: data })

/**
 * 修改商品
 * 对应 Rust 后端 update_product 命令
 */
export const updateProduct = (data: UpdateProductDto) =>
  tryCMD<Product>('update_product', { input: data })

/**
 * 删除商品
 * 对应 Rust 后端 delete_product 命令
 */
export const deleteProduct = (id: number) =>
  tryCMD<boolean>('delete_product', { id })

/**
 * 获取全部商品
 * 对应 Rust 后端 get_all_products 命令
 */
export const getAllProducts = () => tryCMD<Product[]>('get_all_products')

/**
 * 按 ID 查询商品
 * 对应 Rust 后端 get_product_by_id 命令
 */
export const getProductById = (id: number) =>
  tryCMD<Product>('get_product_by_id', { id })

/**
 * 搜索商品（按名称或分类模糊搜索）
 * 对应 Rust 后端 search_products 命令
 */
export const searchProducts = (keyword: string) =>
  tryCMD<Product[]>('search_products', { keyword })

// 便捷方法
export const productApi = {
  create: createProduct,
  delete: deleteProduct,
  getAll: getAllProducts,
  getById: getProductById,
  search: searchProducts,
  update: updateProduct,
}

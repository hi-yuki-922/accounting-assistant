/**
 * Customer 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/customer.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type { Customer, CreateCustomerDto, UpdateCustomerDto } from './type'

// 导出类型
export * from './type'

/**
 * 创建客户
 * 对应 Rust 后端 create_customer 命令
 */
export const createCustomer = (data: CreateCustomerDto) =>
  tryCMD<Customer>('create_customer', { input: data })

/**
 * 修改客户
 * 对应 Rust 后端 update_customer 命令
 */
export const updateCustomer = (data: UpdateCustomerDto) =>
  tryCMD<Customer>('update_customer', { input: data })

/**
 * 删除客户
 * 对应 Rust 后端 delete_customer 命令
 */
export const deleteCustomer = (id: number) =>
  tryCMD<boolean>('delete_customer', { id })

/**
 * 获取全部客户
 * 对应 Rust 后端 get_all_customers 命令
 */
export const getAllCustomers = () => tryCMD<Customer[]>('get_all_customers')

/**
 * 按 ID 查询客户
 * 对应 Rust 后端 get_customer_by_id 命令
 */
export const getCustomerById = (id: number) =>
  tryCMD<Customer>('get_customer_by_id', { id })

/**
 * 搜索客户（按姓名或电话模糊搜索）
 * 对应 Rust 后端 search_customers 命令
 */
export const searchCustomers = (keyword: string) =>
  tryCMD<Customer[]>('search_customers', { keyword })

// 便捷方法
export const customerApi = {
  create: createCustomer,
  delete: deleteCustomer,
  getAll: getAllCustomers,
  getById: getCustomerById,
  search: searchCustomers,
  update: updateCustomer,
}

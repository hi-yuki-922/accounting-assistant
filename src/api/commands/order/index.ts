/**
 * Order 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/order.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type { Order, OrderDetail, CreateOrderDto, SettleOrderDto } from './type'

// 导出类型
export * from './type'

/**
 * 创建订单
 */
export const createOrder = (data: CreateOrderDto) =>
  tryCMD<Order>('create_order', { input: data })

/**
 * 结账订单
 */
export const settleOrder = (data: SettleOrderDto) =>
  tryCMD<Order>('settle_order', { input: data })

/**
 * 取消订单
 */
export const cancelOrder = (id: number) => tryCMD<Order>('cancel_order', { id })

/**
 * 获取全部订单
 */
export const getAllOrders = () => tryCMD<Order[]>('get_all_orders')

/**
 * 按 ID 查询订单（含明细）
 */
export const getOrderById = (id: number) =>
  tryCMD<OrderDetail>('get_order_by_id', { id })

/**
 * 按客户查询订单
 */
export const getOrdersByCustomerId = (customerId: number) =>
  tryCMD<Order[]>('get_orders_by_customer_id', { customerId })

/**
 * 按状态筛选订单
 */
export const getOrdersByStatus = (status: string) =>
  tryCMD<Order[]>('get_orders_by_status', { status })

// 便捷方法
export const orderApi = {
  cancel: cancelOrder,
  create: createOrder,
  getAll: getAllOrders,
  getById: getOrderById,
  getByCustomerId: getOrdersByCustomerId,
  getByStatus: getOrdersByStatus,
  settle: settleOrder,
}

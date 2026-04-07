/**
 * Order 模块 IPC 命令实现
 * 与 Rust 后端 src-tauri/src/commands/order.rs 中的命令对齐
 */

import { tryCMD } from '@/lib'

import type {
  Order,
  OrderDetail,
  CreateOrderDto,
  SettleOrderDto,
  UpdateOrderDto,
  QueryOrdersDto,
  QueryOrdersResult,
  SettlePreview,
} from './type'

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
 * 获取结算预览（按品类分组展示记账预览）
 */
export const getSettlePreview = (orderId: number, actualAmount?: number) =>
  tryCMD<SettlePreview>('get_settle_preview', {
    input: { orderId, actualAmount },
  })

/**
 * 取消订单
 */
export const cancelOrder = (id: number) => tryCMD<Order>('cancel_order', { id })

/**
 * 编辑订单
 */
export const updateOrder = (data: UpdateOrderDto) =>
  tryCMD<Order>('update_order', { input: data })

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

/**
 * 分页查询订单
 */
export const queryOrders = (data: QueryOrdersDto) =>
  tryCMD<QueryOrdersResult>('query_orders', { input: data })

// 便捷方法
export const orderApi = {
  cancel: cancelOrder,
  create: createOrder,
  getAll: getAllOrders,
  getById: getOrderById,
  getByCustomerId: getOrdersByCustomerId,
  getByStatus: getOrdersByStatus,
  query: queryOrders,
  settle: settleOrder,
  settlePreview: getSettlePreview,
  update: updateOrder,
}

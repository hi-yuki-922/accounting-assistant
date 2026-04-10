/**
 * 工具统一导出
 * 提供 getAllTools() 和 getToolsByCategory() 函数
 */

import type { Tool } from 'ai'

import {
  createRecord,
  createWriteOff,
  searchRecords,
  updateRecord,
} from './accounting'
import {
  getProductDetail,
  searchBooks,
  searchCategories,
  searchCustomers,
  searchProducts,
} from './basic-data'
import { createOrder, getOrderDetail, searchOrders, settleOrder } from './order'
import { getCurrentDatetime } from './system'

// oxlint-disable-next-line typescript/no-explicit-any
type AnyTool = Tool<any, any>

/**
 * 工具类别
 */
export type ToolCategory = 'basic-data' | 'order' | 'accounting' | 'system'

/**
 * 全部工具合集
 */
const allTools = {
  // 基础资料
  search_books: searchBooks,
  search_customers: searchCustomers,
  search_products: searchProducts,
  search_categories: searchCategories,
  get_product_detail: getProductDetail,
  // 订单
  search_orders: searchOrders,
  get_order_detail: getOrderDetail,
  create_order: createOrder,
  settle_order: settleOrder,
  // 记账
  search_records: searchRecords,
  create_record: createRecord,
  update_record: updateRecord,
  create_write_off: createWriteOff,
  // 系统
  get_current_datetime: getCurrentDatetime,
}

/**
 * 按类别组织工具
 */
const toolsByCategory: Record<ToolCategory, Record<string, AnyTool>> = {
  'basic-data': {
    search_books: searchBooks,
    search_customers: searchCustomers,
    search_products: searchProducts,
    search_categories: searchCategories,
    get_product_detail: getProductDetail,
  },
  order: {
    search_orders: searchOrders,
    get_order_detail: getOrderDetail,
    create_order: createOrder,
    settle_order: settleOrder,
  },
  accounting: {
    search_records: searchRecords,
    create_record: createRecord,
    update_record: updateRecord,
    create_write_off: createWriteOff,
  },
  system: {
    get_current_datetime: getCurrentDatetime,
  },
}

/**
 * 获取全部 14 个工具的合集
 */
export const getAllTools = () => allTools

/**
 * 按类别加载工具子集
 * @param category - 工具类别名称
 * @returns 该类别下的工具对象，不存在则返回空对象
 */
export const getToolsByCategory = (category: string): Record<string, AnyTool> =>
  toolsByCategory[category as ToolCategory] ?? {}

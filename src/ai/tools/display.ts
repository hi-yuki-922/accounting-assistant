/**
 * 展示工具定义
 * 纯展示型工具，不执行业务逻辑，仅作为 AI 通知前端渲染结构化 UI 的信号
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

const noParams = zodSchema(z.object({}).describe('无参数'))

/**
 * 搜索订单后调用此工具以卡片形式展示结果，不要以 Markdown 表格输出
 */
export const displayOrderList = tool({
  description:
    '搜索订单后调用此工具以卡片形式展示结果。对应工具：search_orders、create_order。不要以 Markdown 表格输出搜索结果。',
  inputSchema: noParams,
  execute: async () => ({ displayed: true }),
})

/**
 * 查询订单详情后调用此工具以卡片形式展示
 */
export const displayOrderDetail = tool({
  description:
    '查询订单详情后调用此工具以卡片形式展示。对应工具：get_order_detail。',
  inputSchema: noParams,
  execute: async () => ({ displayed: true }),
})

/**
 * 搜索或创建记账记录后调用此工具以卡片形式展示结果
 */
export const displayRecordList = tool({
  description:
    '搜索或创建记账记录后调用此工具以卡片形式展示结果。对应工具：search_records、create_record、update_record。不要以 Markdown 表格输出搜索结果。',
  inputSchema: noParams,
  execute: async () => ({ displayed: true }),
})

/**
 * 执行写操作后调用此工具展示操作结果
 */
export const displayOperationResult = tool({
  description:
    '执行写操作后调用此工具展示操作结果。对应工具：settle_order、create_write_off、search_books、search_customers、search_products、search_categories、get_product_detail。',
  inputSchema: noParams,
  execute: async () => ({ displayed: true }),
})

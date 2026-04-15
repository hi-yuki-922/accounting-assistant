/**
 * 订单工具定义
 * 订单搜索、详情、创建、结账
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

import { orderApi } from '@/api/commands/order'
import { orderBoardEmitter } from '@/lib/order-board-events'

/**
 * 搜索订单
 */
export const searchOrders = tool({
  description:
    '按条件搜索订单，支持按日期范围、状态、金额范围、支付渠道、订单类型筛选',
  inputSchema: zodSchema(
    z.object({
      startTime: z.string().optional().describe('开始日期，格式 YYYY-MM-DD'),
      endTime: z.string().optional().describe('结束日期，格式 YYYY-MM-DD'),
      status: z
        .enum(['Pending', 'Settled', 'Cancelled'])
        .optional()
        .describe('订单状态：Pending=待结账, Settled=已结账, Cancelled=已取消'),
      minAmount: z.number().optional().describe('最小金额'),
      maxAmount: z.number().optional().describe('最大金额'),
      channel: z.string().optional().describe('支付渠道'),
      orderType: z
        .enum(['Sales', 'Purchase'])
        .optional()
        .describe('订单类型：Sales=销售, Purchase=采购'),
      page: z.number().optional().describe('页码，默认 1'),
      pageSize: z.number().optional().describe('每页数量，默认 20'),
    })
  ),
  execute: async (input: {
    startTime?: string
    endTime?: string
    status?: string
    minAmount?: number
    maxAmount?: number
    channel?: string
    orderType?: string
    page?: number
    pageSize?: number
  }) => {
    try {
      const result = await orderApi.query({
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 20,
        startTime: input.startTime,
        endTime: input.endTime,
        status: input.status,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        channel: input.channel,
        orderType: input.orderType,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: `搜索成功，共 ${result.value.total} 条订单`,
          data: result.value,
        }
      }
      return {
        success: false,
        message: '搜索失败',
        error: result.error.toString(),
      }
    } catch (error) {
      return {
        success: false,
        message: '搜索失败',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * 获取订单详情（含明细）
 */
export const getOrderDetail = tool({
  description: '根据订单 ID 获取订单详情（含商品明细）',
  inputSchema: zodSchema(
    z.object({
      id: z.number().describe('订单 ID'),
    })
  ),
  execute: async ({ id }: { id: number }) => {
    try {
      const result = await orderApi.getById(id)
      if (result.isOk()) {
        return {
          success: true,
          message: '查询成功',
          data: result.value,
        }
      }
      return {
        success: false,
        message: '查询失败',
        error: result.error.toString(),
      }
    } catch (error) {
      return {
        success: false,
        message: '查询失败',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * 创建订单
 */
export const createOrder = tool({
  description: '创建新订单（销售订单或采购订单）',
  inputSchema: zodSchema(
    z.object({
      orderType: z
        .enum(['Sales', 'Purchase'])
        .describe('订单类型：Sales=销售, Purchase=采购'),
      customerId: z.number().optional().describe('客户 ID'),
      customerName: z
        .string()
        .optional()
        .describe('客户名称，与 customerId 一同传入'),
      items: z
        .array(
          z.object({
            productId: z.number().describe('商品 ID'),
            productName: z.string().describe('商品名称'),
            quantity: z.number().describe('数量'),
            unit: z.string().describe('单位'),
            unitPrice: z.number().describe('单价'),
            remark: z.string().optional().describe('备注'),
          })
        )
        .describe('商品明细列表'),
      remark: z.string().optional().describe('订单备注'),
      actualAmount: z.number().optional().describe('实收/实付金额'),
      subType: z
        .enum(['Wholesale', 'Retail', 'WholesalePurchase', 'PeerTransfer'])
        .optional()
        .describe('业务类型'),
    })
  ),
  execute: async (input: {
    orderType: string
    customerId?: number
    customerName?: string
    items: {
      productId: number
      productName: string
      quantity: number
      unit: string
      unitPrice: number
      remark?: string
    }[]
    remark?: string
    actualAmount?: number
    subType?: string
  }) => {
    try {
      const result = await orderApi.create({
        orderType: input.orderType,
        customerId: input.customerId,
        customerName: input.customerName,
        items: input.items,
        remark: input.remark,
        actualAmount: input.actualAmount,
        subType: input.subType,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: '订单创建成功',
          data: result.value,
        }
      }
      return {
        success: false,
        message: '创建失败',
        error: result.error.toString(),
      }
    } catch (error) {
      return {
        success: false,
        message: '创建失败',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * 订单结账
 */
export const settleOrder = tool({
  description: '对待结账订单执行结账操作',
  inputSchema: zodSchema(
    z.object({
      orderId: z.number().describe('订单 ID'),
      channel: z
        .enum(['Cash', 'AliPay', 'Wechat', 'BankCard'])
        .describe(
          '支付渠道：Cash=现金, AliPay=支付宝, Wechat=微信, BankCard=银行卡'
        ),
      actualAmount: z.number().optional().describe('实收金额'),
    })
  ),
  execute: async (input: {
    orderId: number
    channel: string
    actualAmount?: number
  }) => {
    try {
      const result = await orderApi.settle({
        orderId: input.orderId,
        channel: input.channel,
        actualAmount: input.actualAmount,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: '订单结账成功',
          data: result.value,
        }
      }
      return {
        success: false,
        message: '结账失败',
        error: result.error.toString(),
      }
    } catch (error) {
      return {
        success: false,
        message: '结账失败',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * 通知看板刷新
 * AI 写操作成功后调用此工具，通知前端看板按订单类型刷新数据
 */
export const notifyBoardRefresh = tool({
  description:
    '在订单写操作（创建订单、结账订单、取消订单）成功后调用此工具通知看板刷新。创建/结账销售订单传 Sales，创建/结账采购订单传 Purchase，取消订单传 All。',
  inputSchema: zodSchema(
    z.object({
      orderType: z
        .enum(['Sales', 'Purchase', 'All'])
        .describe('需要刷新的订单类型范围'),
    })
  ),
  execute: async (input: { orderType: 'Sales' | 'Purchase' | 'All' }) => {
    orderBoardEmitter.emit('order-board:refresh', {
      orderType: input.orderType,
    })
    return { refreshed: true }
  },
})

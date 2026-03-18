import { z } from 'zod'

/**
 * 查询记账记录的工具定义
 */
export const queryRecordsTool = {
  description: '查询用户的记账记录，支持按时间范围、类型、金额等条件筛选',
  execute: () => ({
    data: [],
    message: '查询记账记录功能尚未实现',
    success: true,
  }),
  parameters: z.object({
    endDate: z.string().optional().describe('结束日期，格式：YYYY-MM-DD'),
    limit: z.number().optional().describe('返回记录的最大数量，默认 10'),
    maxAmount: z.number().optional().describe('最大金额'),
    minAmount: z.number().optional().describe('最小金额'),
    startDate: z.string().optional().describe('开始日期，格式：YYYY-MM-DD'),
    type: z
      .enum(['收入', '支出', '投资收益', '投资亏损'])
      .optional()
      .describe('记账类型'),
  }),
}

/**
 * 获取财务统计的工具定义
 */
export const getStatisticsTool = {
  description: '获取财务统计数据，包括总收入、总支出、投资收益等汇总信息',
  execute: () => ({
    data: {
      balance: 0,
      investmentIncome: 0,
      investmentLoss: 0,
      totalExpenditure: 0,
      totalIncome: 0,
    },
    message: '财务统计功能尚未实现',
    success: true,
  }),
  parameters: z.object({
    period: z
      .enum(['today', 'week', 'month', 'year'])
      .optional()
      .describe('统计周期：今天、本周、本月、今年'),
  }),
}

/**
 * 获取最近交易记录的工具定义
 */
export const getRecentTransactionsTool = {
  description: '获取最近的交易记录，用于了解用户的近期财务活动',
  execute: () => ({
    data: [],
    message: '获取最近交易功能尚未实现',
    success: true,
  }),
  parameters: z.object({
    limit: z.number().optional().describe('返回记录的最大数量，默认 5'),
  }),
}

/**
 * 添加记账记录的工具定义
 */
export const addRecordTool = {
  description: '添加一条新的记账记录',
  execute: () => ({
    data: null,
    message: '添加记账记录功能尚未实现',
    success: true,
  }),
  parameters: z.object({
    amount: z.number().describe('金额'),
    channel: z.enum(['现金', '支付宝', '微信', '银行卡']).describe('支付渠道'),
    date: z.string().describe('日期，格式：YYYY-MM-DD'),
    remark: z.string().optional().describe('备注信息'),
    title: z.string().describe('记账标题'),
    type: z.enum(['收入', '支出', '投资收益', '投资亏损']).describe('记账类型'),
  }),
}

/**
 * 所有财务工具的集合
 */
export const financeTools = {
  add_record: addRecordTool,
  get_recent_transactions: getRecentTransactionsTool,
  get_statistics: getStatisticsTool,
  query_records: queryRecordsTool,
}

/**
 * 记账工具定义
 * 记账记录搜索、创建、修改、冲账
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

import { accounting } from '@/api/commands/accounting'
import { accountingBook } from '@/api/commands/accounting-book'

/**
 * 搜索记账记录
 */
export const searchRecords = tool({
  description: '按条件搜索记账记录，需指定账本 ID',
  inputSchema: zodSchema(
    z.object({
      bookId: z.number().describe('账本 ID'),
      page: z.number().optional().describe('页码，默认 1'),
      pageSize: z.number().optional().describe('每页数量，默认 20'),
      startTime: z.string().optional().describe('开始日期，格式 YYYY-MM-DD'),
      endTime: z.string().optional().describe('结束日期，格式 YYYY-MM-DD'),
      accountingType: z
        .enum([
          'Income',
          'Expenditure',
          'InvestmentIncome',
          'InvestmentLoss',
          'WriteOff',
        ])
        .optional()
        .describe('记账类型'),
      channel: z
        .enum(['Cash', 'AliPay', 'Wechat', 'BankCard'])
        .optional()
        .describe('支付渠道'),
      state: z
        .enum(['PendingPosting', 'Posted'])
        .optional()
        .describe('记录状态：PendingPosting=待入账, Posted=已入账'),
    })
  ),
  execute: async (input: {
    bookId: number
    page?: number
    pageSize?: number
    startTime?: string
    endTime?: string
    accountingType?: string
    channel?: string
    state?: string
  }) => {
    try {
      const result = await accountingBook.getRecordsByBookId({
        bookId: input.bookId,
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 20,
        startTime: input.startTime,
        endTime: input.endTime,
        accountingType: input.accountingType,
        channel: input.channel,
        state: input.state,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: `查询成功，共 ${result.value.total} 条记录`,
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
 * 创建记账记录
 */
export const createRecord = tool({
  description: '创建一条新的记账记录',
  inputSchema: zodSchema(
    z.object({
      amount: z.number().positive().describe('金额'),
      recordTime: z.string().describe('记账时间，格式 YYYY-MM-DD HH:mm:ss'),
      accountingType: z
        .enum(['Income', 'Expenditure', 'InvestmentIncome', 'InvestmentLoss'])
        .describe(
          '记账类型：Income=收入, Expenditure=支出, InvestmentIncome=投资收益, InvestmentLoss=投资亏损'
        ),
      title: z.string().describe('记账标题'),
      channel: z
        .enum(['Cash', 'AliPay', 'Wechat', 'BankCard'])
        .describe(
          '支付渠道：Cash=现金, AliPay=支付宝, Wechat=微信, BankCard=银行卡'
        ),
      remark: z.string().optional().describe('备注'),
      bookId: z.number().optional().describe('账本 ID，不指定则存入默认账本'),
    })
  ),
  execute: async (input: {
    amount: number
    recordTime: string
    accountingType: string
    title: string
    channel: string
    remark?: string
    bookId?: number
  }) => {
    try {
      const result = await accounting.create({
        amount: input.amount,
        recordTime: input.recordTime,
        accountingType: input.accountingType,
        title: input.title,
        channel: input.channel,
        remark: input.remark,
        bookId: input.bookId,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: '记账记录创建成功',
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
 * 修改记账记录
 */
export const updateRecord = tool({
  description: '修改已有的记账记录',
  inputSchema: zodSchema(
    z.object({
      id: z.number().describe('记账记录 ID'),
      amount: z.number().positive().optional().describe('金额'),
      recordTime: z.string().optional().describe('记账时间'),
      accountingType: z
        .enum(['Income', 'Expenditure', 'InvestmentIncome', 'InvestmentLoss'])
        .optional()
        .describe('记账类型'),
      title: z.string().optional().describe('标题'),
      remark: z.string().optional().describe('备注'),
    })
  ),
  execute: async (input: {
    id: number
    amount?: number
    recordTime?: string
    accountingType?: string
    title?: string
    remark?: string
  }) => {
    try {
      const result = await accounting.update({
        id: input.id,
        amount: input.amount,
        recordTime: input.recordTime,
        accountingType: input.accountingType,
        title: input.title,
        remark: input.remark,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: '记账记录修改成功',
          data: result.value,
        }
      }
      return {
        success: false,
        message: '修改失败',
        error: result.error.toString(),
      }
    } catch (error) {
      return {
        success: false,
        message: '修改失败',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

/**
 * 创建冲账记录
 */
export const createWriteOff = tool({
  description: '对已有的记账记录创建冲账（金额修正）',
  inputSchema: zodSchema(
    z.object({
      originalRecordId: z.number().describe('被冲账的原始记录 ID'),
      amount: z.number().describe('冲账金额'),
      channel: z
        .enum(['Cash', 'AliPay', 'Wechat', 'BankCard'])
        .optional()
        .describe('支付渠道，不指定则继承原始记录'),
      remark: z.string().optional().describe('冲账原因/备注'),
      recordTime: z
        .string()
        .optional()
        .describe('记录时间，不指定则使用当前时间'),
    })
  ),
  execute: async (input: {
    originalRecordId: number
    amount: number
    channel?: string
    remark?: string
    recordTime?: string
  }) => {
    try {
      const result = await accounting.createWriteOff({
        originalRecordId: input.originalRecordId,
        amount: input.amount,
        channel: input.channel,
        remark: input.remark,
        recordTime: input.recordTime,
      })
      if (result.isOk()) {
        return {
          success: true,
          message: '冲账记录创建成功',
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

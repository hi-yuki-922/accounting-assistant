/**
 * AI 财务工具定义
 * 使用 AI SDK 的 tool 函数创建可被 Agent 调用的工具
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

import {
  accounting,
  type AddAccountingRecordDto,
} from '@/api/commands/accounting'
import {
  accountingBook,
  type CreateBookDto,
} from '@/api/commands/accounting-book'
import { attachment, QueryAttachmentsParams } from '@/api/commands/attachment'

/**
 * 添加记账记录工具
 */
export const addRecordTool = tool({
  description: '添加一条新的记账记录',
  inputSchema: zodSchema(
    z.object({
      accounting_type: z
        .enum(['收入', '支出', '投资收益', '投资亏损'])
        .describe('记账类型：收入, 支出, 投资收益, 投资亏损'),
      amount: z.number().describe('金额'),
      book_id: z.number().optional().describe('账本 ID'),
      channel: z
        .enum(['现金', '支付宝', '微信', '银行卡'])
        .describe('支付渠道：现金, 支付宝, 微信, 银行卡'),
      record_time: z.string().describe('日期，格式：YYYY-MM-DD HH:mm:ss'),
      remark: z.string().optional().describe('备注信息'),
      title: z.string().describe('记账标题'),
    })
  ),
  execute: async (input: AddAccountingRecordDto) => {
    try {
      const result = await accounting.add({
        accounting_type: input.accounting_type as any,
        amount: input.amount,
        book_id: input.book_id,
        channel: input.channel as any,
        record_time: input.record_time,
        remark: input.remark,
        title: input.title,
      })

      if (result.isOk()) {
        return {
          data: result.value,
          message: '记账记录添加成功',
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '添加失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '添加失败',
        success: false,
      }
    }
  },
})

/**
 * 查询账本列表工具
 */
export const queryBooksTool = tool({
  description: '查询所有账本列表',
  inputSchema: zodSchema(z.object({}).describe('无参数')),
  execute: async () => {
    try {
      const result = await accountingBook.getAll()

      if (result.isOk()) {
        return {
          data: result.value,
          message: `查询成功，共 ${result.value.length} 个账本`,
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '查询失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '查询失败',
        success: false,
      }
    }
  },
})

/**
 * 创建账本工具
 */
export const createBookTool = tool({
  description: '创建一个新的账本',
  inputSchema: zodSchema(
    z.object({
      description: z.string().optional().describe('账本描述'),
      title: z.string().describe('账本标题'),
    })
  ),
  execute: async (input: CreateBookDto) => {
    try {
      const result = await accountingBook.create({
        description: input.description,
        title: input.title,
      })

      if (result.isOk()) {
        return {
          data: result.value,
          message: '账本创建成功',
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '创建失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '创建失败',
        success: false,
      }
    }
  },
})

/**
 * 获取账本统计工具
 */
export const getBookStatsTool = tool({
  description: '获取指定账本的统计信息',
  inputSchema: zodSchema(
    z.object({
      book_id: z.number().describe('账本 ID'),
    })
  ),
  execute: async ({ book_id }: { book_id: number }) => {
    try {
      const result = await accountingBook.getStats(book_id)

      if (result.isOk()) {
        return {
          data: result.value,
          message: '统计信息获取成功',
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '获取统计失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '获取统计失败',
        success: false,
      }
    }
  },
})

/**
 * 获取所有账本统计工具
 */
export const getAllBooksStatsTool = tool({
  description: '获取所有账本的统计信息汇总',
  inputSchema: zodSchema(z.object({}).describe('无参数')),
  execute: async () => {
    try {
      const result = await accountingBook.getAllStats()

      if (result.isOk()) {
        return {
          data: result.value,
          message: '统计信息获取成功',
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '获取统计失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '获取统计失败',
        success: false,
      }
    }
  },
})

/**
 * 查询附件工具
 */
export const queryAttachmentsTool = tool({
  description: '查询附件列表',
  inputSchema: zodSchema(
    z.object({
      page: z.number().optional().describe('页码'),
      page_size: z.number().optional().describe('每页数量'),
    })
  ),
  execute: async (input: QueryAttachmentsParams) => {
    try {
      const result = await attachment.query({
        page: input.page || 1,
        page_size: input.page_size || 10,
      })

      if (result.isOk()) {
        return {
          data: result.value.items,
          message: `查询成功，共 ${result.value.items.length} 个附件`,
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '查询失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '查询失败',
        success: false,
      }
    }
  },
})

/**
 * 按主键查询附件工具
 */
export const getAttachmentsByMasterIdTool = tool({
  description: '按主键 ID 查询关联的所有附件',
  inputSchema: zodSchema(z.number().describe('主键 ID（记录 ID 或账本 ID）')),
  execute: async (masterId: number) => {
    try {
      const result = await attachment.getByMasterId(masterId)

      if (result.isOk()) {
        return {
          data: result.value,
          message: `查询成功，共 ${result.value.length} 个附件`,
          success: true,
        }
      }

      return {
        error: result.error.toString(),
        message: '查询失败',
        success: false,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        message: '查询失败',
        success: false,
      }
    }
  },
})

/**
 * 所有财务工具的集合
 */
export const financeTools = {
  add_record: addRecordTool,
  create_book: createBookTool,
  get_all_books_stats: getAllBooksStatsTool,
  get_attachments_by_master_id: getAttachmentsByMasterIdTool,
  get_book_stats: getBookStatsTool,
  query_attachments: queryAttachmentsTool,
  query_books: queryBooksTool,
}

/**
 * 工具集类型
 */
export type FinanceTools = typeof financeTools

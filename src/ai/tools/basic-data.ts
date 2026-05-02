/**
 * 基础资料工具定义
 * 账本、客户、商品、品类查询
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

import { accountingBook } from '@/api/commands/accounting-book'
import { categoryApi } from '@/api/commands/category'
import { customerApi } from '@/api/commands/customer'
import { productApi } from '@/api/commands/product'

/**
 * 查询所有账本
 */
export const searchBooks = tool({
  description: '查询所有账本列表',
  inputSchema: zodSchema(z.object({}).describe('无参数')),
  execute: async () => {
    try {
      const result = await accountingBook.getAll()
      if (result.isOk()) {
        return {
          success: true,
          message: `查询成功，共 ${result.value.length} 个账本`,
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
 * 按关键词搜索客户
 */
export const searchCustomers = tool({
  description: '按姓名或电话模糊搜索客户',
  inputSchema: zodSchema(
    z.object({
      keyword: z.string().describe('搜索关键词（客户姓名或电话）'),
    })
  ),
  execute: async ({ keyword }: { keyword: string }) => {
    try {
      const result = await customerApi.search(keyword)
      if (result.isOk()) {
        return {
          success: true,
          message: `搜索成功，找到 ${result.value.length} 个客户`,
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
 * 按关键词搜索商品
 */
export const searchProducts = tool({
  description: '按名称或分类模糊搜索商品',
  inputSchema: zodSchema(
    z.object({
      keyword: z.string().describe('搜索关键词（商品名称或分类）'),
    })
  ),
  execute: async ({ keyword }: { keyword: string }) => {
    try {
      const result = await productApi.search(keyword)
      if (result.isOk()) {
        return {
          success: true,
          message: `搜索成功，找到 ${result.value.length} 个商品`,
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
 * 查询所有品类
 */
export const searchCategories = tool({
  description: '查询所有商品品类列表',
  inputSchema: zodSchema(z.object({}).describe('无参数')),
  execute: async () => {
    try {
      const result = await categoryApi.getAll()
      if (result.isOk()) {
        return {
          success: true,
          message: `查询成功，共 ${result.value.length} 个品类`,
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
 * 获取商品详情（含参考价格）
 */
export const getProductDetail = tool({
  description: '根据商品 ID 获取商品详情（含参考售价和采购价）',
  inputSchema: zodSchema(
    z.object({
      id: z.number().describe('商品 ID'),
    })
  ),
  execute: async ({ id }: { id: number }) => {
    try {
      const result = await productApi.getById(id)
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

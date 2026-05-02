/**
 * 系统工具定义
 * 前端本地执行，无需 IPC 调用
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

/**
 * 获取当前日期时间
 */
export const getCurrentDatetime = tool({
  description: '获取当前日期时间，格式为 YYYY-MM-DD HH:mm:ss',
  inputSchema: zodSchema(z.object({}).describe('无参数')),
  execute: async () => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

    return {
      success: true,
      message: `当前时间: ${datetime}`,
      data: { datetime },
    }
  },
})

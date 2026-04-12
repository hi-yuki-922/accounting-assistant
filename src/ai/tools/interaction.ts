/**
 * 交互型工具定义
 * confirm_operation（操作确认）和 collect_missing_fields（缺失信息收集）
 */

import { tool, zodSchema } from 'ai'
import { z } from 'zod'

/**
 * 操作确认工具
 * Agent 在确认模式下执行写操作前调用，返回 pending 状态结束当前轮次
 * 用户确认/取消后通过隐藏消息触发新一轮
 */
export const confirmOperation = tool({
  description:
    '确认模式专用：执行写操作前请求用户确认。调用后本轮对话结束，等待用户确认或取消。确认模式下执行写操作时必须先调用此工具。',
  inputSchema: zodSchema(
    z.object({
      toolName: z.string().describe('要执行的工具名称'),
      params: z.record(z.string(), z.unknown()).describe('要传递给工具的参数'),
      description: z
        .string()
        .describe('对操作的简要描述，展示给用户以帮助其决定是否确认'),
    })
  ),
  execute: async ({ toolName, params, description }) => ({
    pending: true,
    toolName,
    params,
    description,
  }),
})

/**
 * 缺失信息收集工具
 * Agent 检测到必填字段缺失时调用，返回 pending 状态结束当前轮次
 * 前端根据 toolName 从 writeToolFieldMap 获取字段定义渲染表单
 */
export const collectMissingFields = tool({
  description:
    '当用户请求执行写操作但缺少必填参数时调用此工具收集缺失字段。调用后本轮对话结束，等待用户填写表单提交。',
  inputSchema: zodSchema(
    z.object({
      toolName: z.string().describe('要执行的工具名称'),
      missingFields: z.array(z.string()).describe('缺失的必填字段名列表'),
      providedParams: z
        .record(z.string(), z.unknown())
        .describe('用户已提供的参数'),
    })
  ),
  execute: async ({ toolName, missingFields, providedParams }) => ({
    pending: true,
    toolName,
    missingFields,
    providedParams,
  }),
})

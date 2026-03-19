/**
 * AI Provider 配置
 * 使用智谱 AI 的 ZhipuProvider 创建 ToolLoopAgent
 */

import { ToolLoopAgent } from 'ai'
import { createZhipu } from 'zhipu-ai-provider'

import { financeTools } from './chat-tools'
import type { FinanceTools } from './chat-tools'

/**
 * 创建智谱 AI Provider
 * @param apiKey - 智谱 AI API Key
 */
export const createZAiProvider = (apiKey: string) =>
  createZhipu({ apiKey, baseURL: 'https://open.bigmodel.cn/api/paas/v4' })

/**
 * 创建财务助手 Agent
 * 使用 AI SDK 的 ToolLoopAgent 创建可用的财务 Agent
 *
 * @param apiKey - 智谱 AI API Key
 * @param tools - Agent 可用的工具集合
 * @param modelName - 使用的模型名称，默认为 glm-4.7
 * @returns ToolLoopAgent 实例
 */
export const createFinanceAgent = (
  apiKey: string,
  tools: FinanceTools = financeTools,
  modelName: string = 'glm-4.7'
) => {
  const zAi = createZAiProvider(apiKey)

  const agent = new ToolLoopAgent({
    instructions: `你是一个专业的财务助手，可以帮助用户进行记账、财务分析和财务咨询。

## 你的能力
1. 查询和分析用户的财务数据
2. 添加新的记账记录
3. 提供个性化的财务建议
4. 创建和管理账本
5. 生成财务报表和统计信息

## 工作流程
1. 理解用户的财务需求
2. 根据需要调用相应的工具获取数据
3. 分析数据并提供有价值的见解
4. 用清晰、友好的语言回答用户问题

## 注意事项
- 金额计算要准确，注意单位（元）
- 日期格式要统一使用 YYYY-MM-DD
- 记账类型要明确：收入、支出、投资收益、投资亏损
- 支付渠道要明确：现金、支付宝、微信、银行卡
- 如果数据不足，请主动询问用户需要补充的信息
- 对于复杂的财务问题，建议用户咨询专业财务顾问

## 响应风格
- 专业且友好
- 简洁明了，避免冗长
- 使用表格或列表呈现数据
- 提供可行的建议`,
    model: zAi(modelName),
    stopWhen: 20,
    toolChoice: 'auto',
    tools,
  })

  return agent
}

/**
 * 支持的模型列表
 */
export const SUPPORTED_MODELS = {
  FAST: 'glm-4-flash', // 快速模型
  ADVANCED: 'glm-4.7', // 高级模型（默认）
} as const

/**
 * 模型类型
 */
export type ModelName = (typeof SUPPORTED_MODELS)[keyof typeof SUPPORTED_MODELS]

/**
 * 从 localStorage 获取用户选择的模型
 */
export const getModelName = (): ModelName => {
  const savedModel = localStorage.getItem('zhipu_model')
  return (savedModel as ModelName) || SUPPORTED_MODELS.ADVANCED
}

/**
 * 保存用户选择的模型到 localStorage
 */
export const saveModelName = (modelName: ModelName): void => {
  localStorage.setItem('zhipu_model', modelName)
}

/**
 * 从 localStorage 获取 API Key
 */
export const getApiKey = (): string | null =>
  localStorage.getItem('zhipu_api_key')

/**
 * 保存 API Key 到 localStorage
 */
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('zhipu_api_key', apiKey)
}

/**
 * 清除 API Key
 */
export const clearApiKey = (): void => {
  localStorage.removeItem('zhipu_api_key')
}

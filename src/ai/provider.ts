/**
 * AI Provider 配置
 * 使用智谱 AI 的 ZhipuProvider 创建 Provider 实例
 */

import { createZhipu } from 'zhipu-ai-provider'

import { tryResult } from '@/lib/index.ts'

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

/**
 * 支持的模型列表
 */
export const SUPPORTED_MODELS = {
  // 快速模型
  FAST: 'glm-4-flash',
  // 高级模型（默认）
  ADVANCED: 'glm-4.7',
} as const

/**
 * 模型类型
 */
export type ModelName = (typeof SUPPORTED_MODELS)[keyof typeof SUPPORTED_MODELS]

/**
 * 保存用户选择的模型到 localStorage
 */
export const saveModelName = (modelName: ModelName): void => {
  localStorage.setItem('zhipu_model', modelName)
}

/**
 * 从 localStorage 获取用户选择的模型
 */
export const getModelName = (): ModelName => {
  const savedModel = localStorage.getItem('zhipu_model')
  return (savedModel as ModelName) || SUPPORTED_MODELS.ADVANCED
}

/**
 * 创建智谱 AI Provider
 */
export const createZAiProvider = tryResult(() => {
  const apiKey = getApiKey()
  if (apiKey === null) {
    throw new Error('未配置 API key')
  }
  return createZhipu({
    apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  })
})

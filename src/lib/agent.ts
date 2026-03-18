import { createFinanceAgent } from './ai-provider'
import { financeTools } from './chat-tools'

/**
 * 获取财务助手 Agent 实例
 * @param apiKey - 智谱 AI API Key
 */
export const getFinanceAgent = (apiKey: string) =>
  createFinanceAgent(apiKey, financeTools as unknown as Record<string, unknown>)

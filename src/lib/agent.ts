import { createFinanceAgent } from './ai-provider'

/**
 * 获取财务助手 Agent 实例
 * @param modelName 模型名称
 */
export const getFinanceAgent = (modelName: string) =>
  createFinanceAgent(modelName)

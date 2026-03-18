import { createZhipu } from 'zhipu-ai-provider'

/**
 * 创建智谱 AI Provider
 * @param apiKey - 智谱 AI API Key
 */
export const createZAiProvider = (apiKey: string) =>
  createZhipu({ apiKey, baseURL: 'https://open.bigmodel.cn/api/paas/v4' })

/**
 * 创建财务助手 Agent
 * @param apiKey - 智谱 AI API Key
 * @param tools - Agent 可用的工具集合
 */
export const createFinanceAgent = (
  apiKey: string,
  tools: Record<string, unknown>
) => {
  const zAi = createZAiProvider(apiKey)

  // AI SDK 的 ToolLoopAgent 功能尚未完全稳定，暂时返回一个简单的对象
  return {
    model: zAi('glm-4.7'),
    system:
      '你是一个专业的财务助手，可以帮助用户进行记账、财务分析和财务咨询。你可以访问用户的财务数据，提供个性化的建议。',
    tools,
  }
}

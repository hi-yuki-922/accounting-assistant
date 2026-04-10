/**
 * Agent 工厂函数
 * 加载提示词 + 加载工具 + 创建 ToolLoopAgent
 */

import { ToolLoopAgent } from 'ai'

import { loadTeamLeaderPrompt } from './prompts/loader'
import { createZAiProvider, getModelName } from './provider'
import { getAllTools } from './tools'

/**
 * 创建事务组长 Agent
 * 动态加载提示词，加载全部工具，使用用户选择的模型
 * @param modelName - 可选模型名称，不传则使用 localStorage 中保存的模型
 */
export const createAgent = async (modelName?: string) => {
  const provider = createZAiProvider()
  if (provider.isErr()) {
    throw new Error(`Provider 创建失败: ${provider.error.message}`)
  }

  const zAi = provider.value
  const model = modelName ?? getModelName()
  const prompt = await loadTeamLeaderPrompt()
  const tools = getAllTools()

  return new ToolLoopAgent({
    instructions: prompt,
    model: zAi(model),
    toolChoice: 'auto',
    tools,
  })
}

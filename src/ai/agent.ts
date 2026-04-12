/**
 * Agent 工厂函数
 * 加载提示词 + 加载工具 + 创建 ToolLoopAgent
 */

import { ToolLoopAgent } from 'ai'

import { loadTeamLeaderPrompt } from './prompts/loader'
import { createZAiProvider, getModelName } from './provider'
import { getAllTools } from './tools'

/**
 * 创建事务组长 Agent 的选项
 */
export type CreateAgentOptions = {
  /** 模型名称，不传则使用 localStorage 中保存的模型 */
  modelName?: string
  /** 额外追加到系统提示词末尾的指令片段 */
  extraInstructions?: string[]
}

/**
 * 创建事务组长 Agent
 * 动态加载提示词，加载全部工具，使用用户选择的模型
 */
export const createAgent = async (options?: CreateAgentOptions) => {
  const provider = createZAiProvider()
  if (provider.isErr()) {
    throw new Error(`Provider 创建失败: ${provider.error.message}`)
  }

  const zAi = provider.value
  const model = options?.modelName ?? getModelName()
  const basePrompt = await loadTeamLeaderPrompt()
  const tools = getAllTools()

  // 组合额外指令片段
  const extraParts = options?.extraInstructions?.filter(Boolean).join('\n\n')
  const prompt = extraParts ? `${basePrompt}\n\n${extraParts}` : basePrompt

  return new ToolLoopAgent({
    instructions: prompt,
    model: zAi(model),
    toolChoice: 'auto',
    tools,
  })
}

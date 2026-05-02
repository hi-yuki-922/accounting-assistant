/**
 * 节摘要生成逻辑
 * 使用 LLM 生成对话节的标题和摘要
 */

import { generateText } from 'ai'

import { createZAiProvider, SUPPORTED_MODELS } from '@/ai/provider'

import type { JSONLMessage } from './types'

/**
 * LLM 摘要生成结果
 */
export type LLMSummaryResult = {
  title: string
  summary: string
}

/**
 * 使用轻量模型（glm-4-flash）基于用户首条消息生成摘要和标题
 * @param userFirstMessage - 用户在节中的第一条消息
 * @returns 标题和摘要
 */
export const generateLLMSummary = async (
  userFirstMessage: string
): Promise<LLMSummaryResult> => {
  const provider = createZAiProvider()
  if (provider.isErr()) {
    throw new Error(provider.error.toString())
  }

  const result = await generateText({
    model: provider.value.languageModel(SUPPORTED_MODELS.FAST),
    prompt: `请根据用户的输入，生成一段简短的对话摘要（不超过30字）和一个简短的标题（不超过10字）。
用户输入：${userFirstMessage}
请严格以 JSON 格式返回，不要包含其他内容：{ "title": "...", "summary": "..." }`,
  })

  const text = result.text.trim()
  // 提取 JSON（可能被 markdown 代码块包裹）
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('LLM 返回格式无法解析')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: String(parsed.title ?? '').slice(0, 20),
    summary: String(parsed.summary ?? '').slice(0, 50),
  }
}

/**
 * 为一节对话生成摘要（兼容旧逻辑）
 * 提取用户消息的前 100 字符作为简单摘要
 * @param messages - 节内全部消息
 * @returns 摘要字符串
 */
export const generateSectionSummary = (messages: JSONLMessage[]): string => {
  const userMessages = messages
    .filter((m): m is Extract<typeof m, { role: 'user' }> => m.role === 'user')
    .map((m) => m.content)

  if (userMessages.length === 0) {
    return '空对话'
  }

  // 取第一条用户消息的前 100 字符作为摘要
  const first = userMessages[0]
  return first.length > 100 ? first.slice(0, 100) + '...' : first
}

/**
 * 从消息列表中提取用户的第一条消息
 */
export const extractFirstUserMessage = (
  messages: JSONLMessage[]
): string | null => {
  const first = messages.find((m) => m.role === 'user')
  return first
    ? (first as Extract<typeof first, { role: 'user' }>).content
    : null
}

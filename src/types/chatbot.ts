/**
 * Chatbot 组件层类型定义
 * 将 JSONLMessage 映射为 UI 友好的展示类型
 */

import type { JSONLMessage } from '@/ai/storage/types'

/**
 * 助手消息中的工具调用信息
 */
export type ToolCallDisplay = {
  id: string
  name: string
  arguments: string
}

/**
 * 展示用消息类型 — 由 JSONLMessage 映射而来
 */
export type DisplayMessage =
  | {
      role: 'user'
      content: string
    }
  | {
      role: 'assistant'
      content: string
      toolCalls: ToolCallDisplay[]
    }

/**
 * 对话状态
 */
export type ChatStatus = 'idle' | 'streaming' | 'error'

/**
 * Section 卡片的展开/折叠状态
 */
export type SectionCollapseState = {
  sectionFile: string
  collapsed: boolean
}

/**
 * Section 卡片 ref 暴露的方法
 */
export type SectionCardHandle = {
  send: (content: string) => Promise<void>
  stop: () => void
}

/**
 * PromptInput 提交回调参数
 */
export type PromptSubmitPayload = {
  content: string
  referenceSectionFile?: string
}

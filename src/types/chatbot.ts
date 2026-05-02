/**
 * Chatbot 组件层类型定义
 * 将 JSONLMessage 映射为 UI 友好的展示类型
 */

/**
 * 工具调用状态
 */
export type ToolCallState = 'calling' | 'completed' | 'error'

/**
 * 展示用消息 Part 类型
 * 对齐 AI SDK 的 UIMessage parts 理念
 */
export type DisplayMessagePart =
  | { type: 'text'; content: string }
  | {
      type: 'tool-call'
      toolCallId: string
      toolName: string
      args: string
      state: ToolCallState
    }
  | {
      type: 'tool-result'
      toolCallId: string
      toolName: string
      result: unknown
    }

/**
 * 展示用消息类型 — 由 JSONLMessage 映射而来
 * 使用 parts 模型支持 text / tool-call / tool-result 混合展示
 */
export type DisplayMessage = {
  id: string
  role: 'user' | 'assistant'
  parts: DisplayMessagePart[]
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

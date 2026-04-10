/**
 * 存储层类型定义
 * Session、SectionSummary、SectionFile 等类型
 */

/**
 * 会话元数据（来自 SQLite）
 */
export type Session = {
  id: number
  title: string
  createdAt: string
  updatedAt: string
}

/**
 * 节摘要（来自 SQLite）
 */
export type SectionSummary = {
  id: number
  sessionId: number
  sectionFile: string
  summary: string
  createdAt: string
}

/**
 * JSONL 消息格式（遵循 OpenAI Chat Completion 规范）
 */
export type JSONLMessage =
  | {
      role: 'user'
      content: string
    }
  | {
      role: 'assistant'
      content: string | null
      tool_calls?: {
        id: string
        type: 'function'
        function: {
          name: string
          arguments: string
        }
      }[]
    }
  | {
      role: 'tool'
      tool_call_id: string
      content: string
    }
  | {
      role: 'system'
      content: string
    }

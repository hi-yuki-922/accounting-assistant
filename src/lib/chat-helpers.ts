/**
 * 聊天辅助函数
 */

import type { UIMessage } from 'ai'

import type { ChatMessage } from '@/types/chat'

/**
 * 将数据库消息转换为 AI SDK 的 UIMessage 格式
 */
export const dbMessageToUIMessage = (dbMessage: ChatMessage): UIMessage => ({
  content: dbMessage.content,
  createdAt: new Date(dbMessage.created_at),
  id: String(dbMessage.id),
  role: dbMessage.role as 'user' | 'assistant' | 'system',
})

/**
 * 从 UIMessage 提取文本内容
 */
export const extractTextFromUIMessage = (message: UIMessage): string => {
  if (typeof message.content === 'string') {
    return message.content
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (part.type === 'text') {
          return part.text
        }
        return ''
      })
      .join('')
  }

  return ''
}

/**
 * 检查是否为 AI 生成的临时会话标题
 */
export const isTempSessionTitle = (title: string): boolean =>
  title === '新对话' || title.startsWith('对话 ')

/**
 * 格式化日期为相对时间
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} 小时前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} 天前`
  }

  return target.toLocaleDateString('zh-CN')
}

/**
 * 智能截断文本，保留关键信息
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }

  const truncated = text.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > maxLength / 2) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

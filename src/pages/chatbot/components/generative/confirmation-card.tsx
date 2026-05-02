/**
 * 操作确认卡片组件
 * 展示 confirm_operation 工具返回的确认请求
 * 用户确认/取消后通过 send 回调注入隐藏消息
 *
 * 确认状态优先级：
 * 1. result._status（从 JSONL 推导的持久化状态，刷新后仍有效）
 * 2. 本地 responded 状态（用户刚点击，JSONL 尚未重算时的即时反馈）
 * 3. 'pending'（默认）
 */

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { ConfirmationStatus } from '@/lib/message-utils'
import { cn } from '@/lib/utils'

export type ConfirmationCardProps = {
  /** 工具调用 ID */
  toolCallId: string
  /** 工具返回的结果 */
  result: {
    pending: boolean
    toolName: string
    params: Record<string, unknown>
    description: string
    /** 由 toDisplayMessages 从 JSONL 推导的确认状态 */
    _status?: ConfirmationStatus
  }
  /** 确认后调用 send 注入隐藏消息 */
  onSend: (content: string) => Promise<void>
}

export const ConfirmationCard = ({ result, onSend }: ConfirmationCardProps) => {
  // 本地即时状态：用户点击后立即设置，直到 JSONL 重算后由 _status 接管
  const [responded, setResponded] = useState<'confirmed' | 'cancelled' | null>(
    null
  )

  // 最终状态：_status（持久化）优先，fallback 到本地 responded
  const status = result._status ?? responded ?? 'pending'

  const handleConfirm = async () => {
    if (status !== 'pending') {
      return
    }
    setResponded('confirmed')
    const message = `用户已确认执行操作。请使用以下参数调用 ${result.toolName}：${JSON.stringify(result.params)}`
    await onSend(message)
  }

  const handleCancel = async () => {
    if (status !== 'pending') {
      return
    }
    setResponded('cancelled')
    await onSend('用户已拒绝执行操作。')
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        (status === 'confirmed' || status === 'completed') &&
          'border-green-200 bg-green-50',
        status === 'cancelled' && 'border-orange-200 bg-orange-50'
      )}
    >
      <p className="break-words text-sm">{result.description}</p>

      {status === 'pending' && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCancel}
          >
            取消
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleConfirm}>
            确认执行
          </Button>
        </div>
      )}

      {status === 'confirmed' && (
        <p className="mt-2 text-xs text-green-600">已确认，正在执行...</p>
      )}

      {status === 'completed' && (
        <p className="mt-2 text-xs text-green-600">已完成</p>
      )}

      {status === 'cancelled' && (
        <p className="mt-2 text-xs text-orange-600">已取消</p>
      )}
    </div>
  )
}

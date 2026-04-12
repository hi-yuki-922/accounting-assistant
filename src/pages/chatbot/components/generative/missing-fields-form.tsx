/**
 * 缺失字段表单组件
 * 当 Agent 调用 collect_missing_fields 时渲染
 * 根据 writeToolFieldMap 动态生成表单
 *
 * 提交状态优先级：
 * 1. result._status（从 JSONL 推导的持久化状态，刷新后仍有效）
 * 2. 本地 responded 状态（用户刚点击，JSONL 尚未重算时的即时反馈）
 * 3. 'pending'（默认）
 */

import { useState } from 'react'

import { writeToolFieldMap } from '@/ai/tools/field-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MissingFieldsStatus } from '@/lib/message-utils'
import { cn } from '@/lib/utils'

export type MissingFieldsFormProps = {
  /** 工具返回的结果 */
  result: {
    pending: boolean
    toolName: string
    missingFields: string[]
    providedParams: Record<string, unknown>
    /** 由 toDisplayMessages 从 JSONL 推导的提交状态 */
    _status?: MissingFieldsStatus
  }
  /** 提交后调用 send 注入隐藏消息 */
  onSend: (content: string) => Promise<void>
}

/**
 * 缺失字段表单
 */
export const MissingFieldsForm = ({
  result,
  onSend,
}: MissingFieldsFormProps) => {
  const { toolName, missingFields, providedParams } = result
  const fieldDefs = writeToolFieldMap[toolName]
  const [formData, setFormData] = useState<Record<string, string>>(
    Object.fromEntries(missingFields.map((f) => [f, '']))
  )
  // 本地即时状态：用户点击后立即设置，直到 JSONL 重算后由 _status 接管
  const [responded, setResponded] = useState<'submitted' | 'cancelled' | null>(
    null
  )

  // 最终状态：_status（持久化）优先，fallback 到本地 responded
  const status = result._status ?? responded ?? 'pending'

  const handleSubmit = async () => {
    if (status !== 'pending') {
      return
    }
    setResponded('submitted')
    const message = `用户已补充信息：${JSON.stringify(formData)}。
请结合之前提供的 ${JSON.stringify(providedParams)}，调用 ${toolName} 完成操作。`
    await onSend(message)
  }

  const handleCancel = async () => {
    if (status !== 'pending') {
      return
    }
    setResponded('cancelled')
    await onSend('用户已取消补充信息。')
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const hasEmpty = Object.values(formData).some((v) => !v.trim())

  if (status === 'submitted') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="text-xs text-green-600">已提交，正在执行...</p>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="text-xs text-green-600">已完成</p>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
        <p className="text-xs text-orange-600">已取消</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border p-3')}>
      <p className="mb-3 text-sm font-medium">请补充以下信息：</p>
      <div className="space-y-2">
        {missingFields.map((field) => {
          const def = fieldDefs?.[field]
          const label = def?.label ?? field

          return (
            <div key={field} className="flex min-w-0 items-center gap-2">
              <label className="w-20 shrink-0 text-xs text-muted-foreground">
                {label}
              </label>
              {def?.type === 'select' && def.options ? (
                <Select
                  value={formData[field]}
                  onValueChange={(v) => updateField(field, v)}
                >
                  <SelectTrigger className="h-8 min-w-0 flex-1 text-xs">
                    <SelectValue placeholder={`请选择${label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {def.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : def?.type === 'number' ? (
                <Input
                  type="number"
                  value={formData[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={`请输入${label}`}
                  className="h-8 text-xs"
                />
              ) : def?.type === 'datetime' ? (
                <Input
                  type="datetime-local"
                  value={formData[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="h-8 text-xs"
                />
              ) : (
                <Input
                  type="text"
                  value={formData[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={`请输入${label}`}
                  className="h-8 text-xs"
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleCancel}
        >
          取消
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleSubmit}
          disabled={hasEmpty}
        >
          提交
        </Button>
      </div>
    </div>
  )
}

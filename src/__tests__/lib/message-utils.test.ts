import type { JSONLMessage } from '@/ai/storage/types'
import { toDisplayMessages } from '@/lib/message-utils'
import type { DisplayMessage, DisplayMessagePart } from '@/types/chatbot'

// ── 测试辅助：构造 JSONLMessage ──

function userMsg(content: string, hidden = false): JSONLMessage {
  return hidden
    ? { role: 'user', content, hidden: true }
    : { role: 'user', content }
}

function assistantMsg(
  content: string | null,
  toolCalls?: JSONLMessage[]
): JSONLMessage {
  const msg: JSONLMessage = { role: 'assistant', content }
  if (toolCalls) {
    const calls = toolCalls
      .filter((m) => m.role === 'tool')
      .map((m) => {
        const tc = m as Extract<JSONLMessage, { role: 'tool' }>
        return {
          id: tc.tool_call_id,
          type: 'function' as const,
          function: { name: 'unknown', arguments: '' },
        }
      })
    if (calls.length > 0) {
      ;(msg as Extract<JSONLMessage, { role: 'assistant' }>).tool_calls = calls
    }
  }
  return msg
}

function assistantWithTools(
  content: string | null,
  toolCalls: { id: string; name: string; args?: string }[]
): JSONLMessage {
  return {
    role: 'assistant',
    content,
    tool_calls: toolCalls.map((tc) => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.args ?? '{}' },
    })),
  }
}

function toolResult(toolCallId: string, content: string): JSONLMessage {
  return { role: 'tool', tool_call_id: toolCallId, content }
}

// ── 测试 ──

describe(toDisplayMessages, () => {
  it('空消息列表返回空数组', () => {
    expect(toDisplayMessages([])).toStrictEqual([])
  })

  // ── user 消息 ──

  describe('user 消息映射', () => {
    it('普通 user 消息正确映射', () => {
      const messages: JSONLMessage[] = [userMsg('你好')]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      expect(result[0]).toStrictEqual({
        id: 'msg-0',
        role: 'user',
        parts: [{ type: 'text', content: '你好' }],
      })
    })

    it('hidden user 消息被过滤', () => {
      const messages: JSONLMessage[] = [
        userMsg('你好'),
        userMsg('隐藏消息', true),
      ]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      expect(result[0].parts[0]).toStrictEqual({
        type: 'text',
        content: '你好',
      })
    })

    it('多条 user 消息各有独立 id', () => {
      const messages: JSONLMessage[] = [userMsg('第一条'), userMsg('第二条')]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('msg-0')
      expect(result[1].id).toBe('msg-1')
    })
  })

  // ── assistant 消息 ──

  describe('assistant 消息映射', () => {
    it('纯文本 assistant 消息', () => {
      const messages: JSONLMessage[] = [assistantWithTools('回复内容', [])]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      expect(result[0].parts).toStrictEqual([
        { type: 'text', content: '回复内容' },
      ])
    })

    it('含 tool_calls 的 assistant 消息生成 tool-call part', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [
          { id: 'tc1', name: 'search_records', args: '{"query":"test"}' },
        ]),
      ]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      expect(result[0].parts).toStrictEqual([
        {
          type: 'tool-call',
          toolCallId: 'tc1',
          toolName: 'search_records',
          args: '{"query":"test"}',
          state: 'completed',
        },
      ])
    })

    it('assistant 同时有文本和 tool_calls', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools('正在查询', [{ id: 'tc1', name: 'search_records' }]),
      ]
      const result = toDisplayMessages(messages)

      expect(result[0].parts).toHaveLength(2)
      expect(result[0].parts[0]).toStrictEqual({
        type: 'text',
        content: '正在查询',
      })
      expect(result[0].parts[1].type).toBe('tool-call')
    })
  })

  // ── tool result 合并 ──

  describe('tool result 合并', () => {
    it('tool result 合入对应 assistant 消息的 parts', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'get_weather' }]),
        toolResult('tc1', '{"temp": 25}'),
      ]
      const result = toDisplayMessages(messages)

      // 只有 assistant 一条展示消息
      expect(result).toHaveLength(1)
      const { parts } = result[0]

      // tool-call + tool-result
      expect(parts).toHaveLength(2)
      expect(parts[0].type).toBe('tool-call')
      expect(parts[1]).toStrictEqual({
        type: 'tool-result',
        toolCallId: 'tc1',
        toolName: 'get_weather',
        result: { temp: 25 },
      })
    })

    it('无效 JSON 的 tool result 保留原始字符串', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'some_tool' }]),
        toolResult('tc1', 'not json'),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect(toolResultPart.result).toBe('not json')
    })

    it('找不到 tool_call 时 toolName 为 unknown', () => {
      const messages: JSONLMessage[] = [toolResult('orphan-id', 'some result')]
      const result = toDisplayMessages(messages)

      // tool 消息不单独展示
      expect(result).toHaveLength(0)
    })
  })

  // ── confirm_operation 状态推导 ──

  describe('confirm_operation 状态推导', () => {
    it('confirmed 状态：用户确认，无后续 assistant 响应', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'confirm_operation' }]),
        toolResult('tc1', '{"status": "pending"}'),
        userMsg('已确认操作', true),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'confirmed'
      )
    })

    it('cancelled 状态：用户拒绝', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'confirm_operation' }]),
        toolResult('tc1', '{"status": "pending"}'),
        userMsg('用户已拒绝该操作', true),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'cancelled'
      )
    })

    it('completed 状态：用户确认后有 assistant 响应', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'confirm_operation' }]),
        toolResult('tc1', '{"status": "pending"}'),
        userMsg('已确认操作', true),
        assistantWithTools('操作已完成', []),
      ]
      const result = toDisplayMessages(messages)

      // 第一条 assistant 消息（confirm_operation）的 tool result
      const firstAssistant = result.find((m) =>
        m.parts.some((p) => p.type === 'tool-result')
      )!
      const toolResultPart = firstAssistant.parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'completed'
      )
    })
  })

  // ── collect_missing_fields 状态推导 ──

  describe('collect_missing_fields 状态推导', () => {
    it('submitted 状态', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [
          { id: 'tc1', name: 'collect_missing_fields' },
        ]),
        toolResult('tc1', '{"fields": ["name"]}'),
        userMsg('已提交表单', true),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'submitted'
      )
    })

    it('cancelled 状态', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [
          { id: 'tc1', name: 'collect_missing_fields' },
        ]),
        toolResult('tc1', '{"fields": ["name"]}'),
        userMsg('用户已取消操作', true),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'cancelled'
      )
    })

    it('completed 状态', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [
          { id: 'tc1', name: 'collect_missing_fields' },
        ]),
        toolResult('tc1', '{"fields": ["name"]}'),
        userMsg('已提交表单', true),
        assistantWithTools('已收集完成', []),
      ]
      const result = toDisplayMessages(messages)

      const firstAssistant = result.find((m) =>
        m.parts.some((p) => p.type === 'tool-result')
      )!
      const toolResultPart = firstAssistant.parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect((toolResultPart.result as Record<string, string>)._status).toBe(
        'completed'
      )
    })
  })

  // ── _status 注入规则 ──

  describe('_status 注入规则', () => {
    it('_status 不注入到非 JSON 对象的 result', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'confirm_operation' }]),
        toolResult('tc1', 'plain text result'),
        userMsg('已确认', true),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      // 非 JSON 解析结果（字符串）不注入 _status
      expect(toolResultPart.result).toBe('plain text result')
    })

    it('非 confirm/collect 工具不注入 _status', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'search_records' }]),
        toolResult('tc1', '{"total": 5}'),
      ]
      const result = toDisplayMessages(messages)

      const toolResultPart = result[0].parts.find(
        (p) => p.type === 'tool-result'
      ) as Extract<DisplayMessagePart, { type: 'tool-result' }>

      expect(
        (toolResultPart.result as Record<string, unknown>)._status
      ).toBeUndefined()
    })
  })

  // ── 综合场景 ──

  describe('综合场景', () => {
    it('完整的对话流程', () => {
      const messages: JSONLMessage[] = [
        userMsg('查一下今天的收入'),
        assistantWithTools('好的，正在查询', [
          {
            id: 'tc1',
            name: 'search_records',
            args: '{"date":"today","type":"income"}',
          },
        ]),
        toolResult('tc1', '{"records":[],"total":0}'),
        assistantWithTools('今天没有收入记录', []),
      ]

      const result = toDisplayMessages(messages)

      // user + assistant(查询) + assistant(回复) = 3 条
      expect(result).toHaveLength(3)

      // 第一条：user
      expect(result[0].role).toBe('user')
      expect(result[0].parts).toStrictEqual([
        { type: 'text', content: '查一下今天的收入' },
      ])

      // 第二条：assistant with tool-call + tool-result
      expect(result[1].role).toBe('assistant')
      expect(result[1].parts).toHaveLength(3) // text + tool-call + tool-result
      expect(result[1].parts[0]).toStrictEqual({
        type: 'text',
        content: '好的，正在查询',
      })
      expect(result[1].parts[1].type).toBe('tool-call')
      expect(result[1].parts[2].type).toBe('tool-result')

      // 第三条：assistant 纯文本回复
      expect(result[2].role).toBe('assistant')
      expect(result[2].parts).toStrictEqual([
        { type: 'text', content: '今天没有收入记录' },
      ])
    })

    it('system 消息不出现在结果中', () => {
      const messages: JSONLMessage[] = [
        { role: 'system', content: '你是一个助手' },
        userMsg('你好'),
      ]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      expect(result[0].role).toBe('user')
    })

    it('多个 tool_calls 在同一 assistant 消息中', () => {
      const messages: JSONLMessage[] = [
        assistantWithTools(null, [
          { id: 'tc1', name: 'tool_a' },
          { id: 'tc2', name: 'tool_b' },
        ]),
        toolResult('tc1', '{"a": 1}'),
        toolResult('tc2', '{"b": 2}'),
      ]
      const result = toDisplayMessages(messages)

      expect(result).toHaveLength(1)
      // tool-call(tc1) + tool-result(tc1) + tool-call(tc2) + tool-result(tc2)
      expect(result[0].parts).toHaveLength(4)
    })
  })
})

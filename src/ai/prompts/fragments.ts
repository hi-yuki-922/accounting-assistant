/**
 * 确认模式指令片段
 * 根据确认模式 ON/OFF 返回不同的 system prompt 指令
 */

/**
 * 写入工具列表（确认模式下需要先确认的工具）
 */
const WRITE_TOOLS = [
  'create_order',
  'settle_order',
  'create_record',
  'update_record',
  'create_write_off',
]

/**
 * 获取确认模式指令片段
 * @param mode - 确认模式状态
 * @returns 追加到 system prompt 的指令片段
 */
export const getConfirmationInstruction = (mode: 'on' | 'off'): string => {
  if (mode === 'on') {
    return `## 确认模式（已开启）

当前处于确认模式。执行以下写操作前，**必须先调用 confirm_operation 工具**请求用户确认，不能直接调用：

写入工具清单：${WRITE_TOOLS.join('、')}

调用流程：
1. 当需要执行写操作时，先调用 confirm_operation({ toolName, params, description })
2. 工具会返回 pending 状态，本轮对话到此结束
3. 用户确认后，你会收到一条 system message 包含确认信息和参数
4. 收到确认消息后，使用提供的参数调用对应的写入工具

注意事项：
- 只有上述写入工具需要确认，查询类工具（search_*、get_*）可直接调用
- description 参数要用简洁的中文描述操作内容和关键参数
- 如果用户已经明确表达了确认意图（如"确认执行"、"就这么办"），仍然需要调用 confirm_operation`
  }

  return `## 确认模式（已关闭）

当前确认模式已关闭。你可以直接执行所有写操作（${WRITE_TOOLS.join('、')}），无需调用 confirm_operation。`
}

/**
 * 获取缺失信息收集指令片段
 */
export const getMissingFieldsInstruction = (): string => `## 缺失信息收集

当用户请求执行写操作但缺少必填参数时：
1. **必须调用 collect_missing_fields({ toolName, missingFields, providedParams }) 工具**，不要直接用自然语言追问缺失的参数
2. 工具会返回 pending 状态，前端会展示表单供用户填写
3. 用户提交后，你会收到包含表单数据的 system message
4. 结合已有参数和表单数据，调用对应的写入工具`

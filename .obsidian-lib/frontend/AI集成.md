# AI 集成

本项目集成了智谱 AI（Zhipu AI），用于财务助手聊天功能。

## 架构概览

```
用户输入
    ↓
chatbot-page.tsx          # 聊天界面
    ↓
use-messages / use-sessions  # 状态管理 Hooks
    ↓
ai-provider.ts            # Zhipu AI Provider + ToolLoopAgent
    ↓ Vercel AI SDK
chat-tools.ts             # 财务工具定义
    ↓ tryCMD
Tauri IPC 后端命令        # 执行实际的财务操作
```

## 核心文件

### ai-provider.ts

AI Provider 配置和 Agent 创建：

```typescript
import { createZhipuAI } from '@/lib/ai-provider'

// 创建 Zhipu AI provider
// 创建 ToolLoopAgent（支持工具循环调用）
```

- 使用 Vercel AI SDK 的 `generateText` / `streamText` 接口
- 支持工具调用循环（ToolLoopAgent）
- 配置了系统提示词，引导 AI 理解财务上下文

### chat-tools.ts

AI SDK 工具定义，让 AI 能够执行财务操作：

工具类型包括：

- **记账操作**：添加记账记录
- **查询操作**：查询账本、获取统计数据
- **附件管理**：查询和管理附件
- **其他财务操作**

每个工具定义包含：

- 名称和描述（帮助 AI 理解何时使用）
- 参数 schema（Zod 定义）
- 执行函数（调用 tryCMD 与后端通信）

### agent.ts

Agent 的薄包装层，提供统一的调用接口。

## 使用模式

### 在聊天页面中使用

```typescript
import { useMessages } from '@/hooks/use-messages'
import { useSessions } from '@/hooks/use-sessions'

// 消息管理和会话管理通过自定义 Hooks
const { messages, loadMessages, createMessage } = useMessages()
const { sessions, currentSession, createSession } = useSessions()

// AI 响应通过 Vercel AI SDK 的 streaming 接口
```

### 工具调用流程

```
用户: "帮我记一笔 50 元的午餐支出"
    ↓ AI 理解意图
AI 选择 add_accounting_record 工具
    ↓ 传入参数
{ amount: 50, title: "午餐", type: "Expenditure", channel: "Cash" }
    ↓ tryCMD 调用
Rust 后端执行 create_accounting_record
    ↓ 返回结果
AI 生成确认消息: "已记录 50 元的午餐支出"
```

## 配置

AI 相关配置通过 Tauri 后端的 config 命令获取（API key、模型选择等）。

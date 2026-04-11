# ai-directory-structure

## Purpose

AI 模块的统一目录结构规范，定义代码组织方式、旧代码迁移策略及实验性代码清理。

## Requirements

### Requirement: AI 模块统一目录结构
系统 SHALL 在 `src/ai/` 目录下统一管理所有 AI 相关代码，目录结构如下：
- `src/ai/provider.ts` — AI Provider 配置
- `src/ai/agent.ts` — Agent 创建工厂
- `src/ai/router.ts` — 对话节路由函数
- `src/ai/tools/` — 工具定义目录（含 `index.ts`、`basic-data.ts`、`order.ts`、`accounting.ts`、`system.ts`）
- `src/ai/prompts/` — 提示词文件目录（含 `shared/` 和 `agents/` 子目录）
- `src/ai/storage/` — 会话存储目录（含 `session-store.ts`、`section-store.ts`、`types.ts`）
- `src/ai/types.ts` — AI 模块共享类型

#### Scenario: 目录结构验证
- **WHEN** 查看 `src/ai/` 目录
- **THEN** 目录下包含 `provider.ts`、`agent.ts`、`router.ts`、`tools/`、`prompts/`、`storage/`、`types.ts`，且各子目录包含对应文件

### Requirement: 弃用实验性 chatbot 页面
系统 SHALL 移除 `src/pages/chatbot/` 目录下所有文件及关联的路由定义。

#### Scenario: chatbot 页面已移除
- **WHEN** 检查 `src/pages/chatbot/` 目录
- **THEN** 该目录不存在或为空

#### Scenario: chatbot 路由已移除
- **WHEN** 检查路由配置
- **THEN** 不存在指向 `/chatbot` 的路由定义

### Requirement: 迁移现有 AI 代码
系统 SHALL 将以下现有文件的功能迁移到 `src/ai/` 目录：
- `src/lib/ai-provider.ts` → `src/ai/provider.ts`
- `src/lib/chat-tools.ts` → `src/ai/tools/` 下按类别拆分
- `src/lib/agent.ts` → `src/ai/agent.ts`（合并）
- `src/types/agent.ts` → `src/ai/types.ts`

#### Scenario: 旧文件已清理
- **WHEN** 检查 `src/lib/ai-provider.ts`、`src/lib/chat-tools.ts`、`src/lib/agent.ts`
- **THEN** 这些文件不存在或不再被任何模块引用

### Requirement: IPC 接口层保持不变
系统 SHALL 保持 `src/api/commands/chat/` 目录下的 Tauri IPC 接口层不变，AI 模块通过调用 IPC 接口与后端通信。

#### Scenario: IPC 接口独立存在
- **WHEN** 查看 `src/api/commands/` 目录
- **THEN** 各业务模块（accounting、order、product 等）的 IPC 接口文件保持原有结构

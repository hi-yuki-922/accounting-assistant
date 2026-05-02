## Context

项目前端基于 Vite 8 + React 19 + TypeScript 5.9 构建，当前没有任何测试基础设施。`src/lib/` 下存在多个纯函数模块，其中 `formatters.ts`（13 个格式化函数）和 `message-utils.ts`（AI 聊天消息转换）是最适合优先覆盖的目标。

## Goals / Non-Goals

**Goals:**
- 建立 vitest 测试基础设施，为后续扩展测试范围铺路
- 对 `formatters.ts` 的 12 个格式化函数实现完整单元测试覆盖
- 对 `message-utils.ts` 的 `toDisplayMessages` 核心转换逻辑实现完整单元测试覆盖
- 测试文件统一放置在 `src/__tests__/lib/` 目录下

**Non-Goals:**
- 不覆盖 React Hooks 层（use-section-chat 等）
- 不覆盖 UI 组件渲染测试
- 不覆盖 API 层（src/api/）
- 不测试 mock-data.ts（即将弃用）
- 不测试 utils.ts（cn 是第三方库单行封装）和 constants.ts（纯静态数据）
- 不测试 formatRelativeTime（内部依赖 new Date() 导致测试不稳定）
- 不引入 @testing-library/react 等组件测试工具

## Decisions

### D1: vitest 配置放在 vite.config.ts 而非独立文件

vitest 原生支持 Vite 配置中的 `test` 块。项目已有 vite.config.ts，直接在其中添加 `test` 配置，避免多配置文件维护负担。使用 `/// <reference types="vitest/config" />` 三斜线指令获取类型提示。

### D2: 测试文件放在 src/__tests__/lib/ 而非就近放置

用户选择集中式目录（方案 B）。优点是测试文件与源码分离，源码目录保持干净；缺点是跳转时路径稍长。目录结构为 `src/__tests__/lib/formatters.test.ts` 对应 `src/lib/formatters.ts`。

### D3: message-utils 测试依赖的类型通过路径别名引入

`message-utils.ts` 导入了 `@/ai/storage/types` 和 `@/types/chatbot` 的类型。由于 vitest 共享 vite.config.ts 的 resolve.alias 配置，`@/` 路径别名自动生效，无需额外处理。这些导入仅为类型导入（`import type`），不影响运行时。

### D4: formatters 测试策略——按函数分组 describe

每个格式化函数使用独立的 `describe` 块，内部按"正常值 → 边界值 → 参数组合"组织 `it` 用例。这样测试报告清晰，失败时能快速定位到具体函数。

### D5: message-utils 测试策略——按场景分组

`toDisplayMessages` 是单一函数但有多条转换路径。按消息角色和功能场景分组：空消息列表、user 消息、assistant 消息、hidden 消息过滤、tool_calls 合并、confirm_operation 状态推导、collect_missing_fields 状态推导。

### D6: 跳过 formatRelativeTime

该函数内部调用 `new Date()` 获取当前时间，虽然可以用 `vi.useFakeTimers()` 解决，但考虑到：
- 该函数逻辑简单（纯数学比较）
- 引入 fake timers 会增加测试复杂度
- 用户确认不需要测试

因此直接跳过。

## Risks / Trade-offs

- **[toLocaleString 平台差异]** → `formatCurrency` 和 `formatDate` 使用 `toLocaleString('zh-CN', ...)` 生成输出，不同 Node.js 版本/操作系统的格式化结果可能略有差异（如分隔符、空格）。测试中使用合理的断言策略（正则匹配或快照）降低风险。
- **[message-utils 类型依赖]** → `toDisplayMessages` 依赖 `JSONLMessage` 和 `DisplayMessage` 类型定义。如果这些类型未来变更（如新增字段），测试数据需要同步更新。这是正常的维护成本。
- **[测试覆盖率的期望管理]** → 本次仅覆盖纯函数层，不代表项目有了充分的测试保障。Hooks 和组件层仍无覆盖。

## Why

项目前端目前没有任何测试基础设施——零测试文件、零测试配置、零测试脚本。`src/lib/` 下的纯函数和工具模块是整个应用的基础层，缺乏测试覆盖导致重构和修改时无法快速验证正确性，尤其 `formatters.ts` 涉及金融金额格式化、`message-utils.ts` 负责 AI 聊天消息的核心转换逻辑，这些模块的隐性 bug 难以通过手动发现。

## What Changes

- 安装 vitest 及相关类型依赖，在项目中建立前端单元测试基础设施
- 在 `vite.config.ts` 中添加 vitest 配置（test 块），包括路径别名 `@/` 支持
- 在 `package.json` 中添加 `test` 和 `test:run` 脚本
- 创建 `src/__tests__/lib/` 目录，按模块组织测试文件
- 为 `formatters.ts` 中 12 个格式化函数编写单元测试（跳过 `formatRelativeTime`，因内部依赖 `new Date()` 导致测试不稳定）
- 为 `message-utils.ts` 中 `toDisplayMessages` 函数编写单元测试，覆盖空消息、基本对话、hidden 消息过滤、tool_calls 合并、confirm_operation/collect_missing_fields 状态推导等场景

## Capabilities

### New Capabilities
- `vitest-infrastructure`: 前端单元测试基础设施，包括 vitest 配置、测试脚本、路径别名支持、`@vitejs/plugin-react` 集成
- `lib-formatters-tests`: `formatters.ts` 12 个格式化函数的完整测试覆盖，包括正常值、边界值（null/undefined/NaN/零值/负数）、各参数组合
- `lib-message-utils-tests`: `message-utils.ts` 核心转换逻辑的测试覆盖，包括消息映射、状态推导、JSON 解析注入

### Modified Capabilities
- `vite-config`: 添加 vitest 的 `test` 配置块

## Impact

- **构建配置**: vite.config.ts（添加 test 配置块）、package.json（新增依赖和脚本）
- **新增文件**: src/__tests__/lib/formatters.test.ts、src/__tests__/lib/message-utils.test.ts
- **依赖**: 新增 vitest（devDependency）
- **无生产代码变更**: 本次变更仅涉及测试基础设施和测试文件，不修改任何 src/lib/ 下的源代码

## Non-goals

- 不覆盖 React Hooks 层测试（use-section-chat 等）
- 不覆盖 UI 组件渲染测试
- 不覆盖 API 层测试（src/api/）
- 不测试 mock-data.ts（即将弃用）
- 不测试 utils.ts（cn 是第三方库封装）和 constants.ts（纯静态数据）
- 不测试 formatRelativeTime（时间依赖导致测试不稳定）

## Why

当前 IPC 接口使用 snake_case 命名风格，与前端 JavaScript/TypeScript 的 camelCase 约定不一致。这导致类型定义和使用上的不一致，降低了代码可读性和可维护性。使用 serde 的双向转换能力可以自动处理命名风格转换，让 Rust 后端保持 snake_case 约定，而前端使用 camelCase，各自遵循最佳实践。

## What Changes

- **后端改造**：
  - 为所有用于 IPC 的 Entity 添加 `#[serde(rename_all = "camelCase")]` 属性
  - 为所有 DTO 添加 `#[serde(rename_all = "camelCase")]` 属性（部分已存在）
  - Rust 内部代码保持 snake_case 命名不变

- **前端改造**：
  - 将所有 IPC 相关类型定义的小写 snake_case 字段改为 camelCase
  - 更新所有使用这些类型的代码以匹配新字段名
  - 保持全大写 SNAKE_CASE 常量不变（如 `DEFAULT_BOOK_ID`、`PAGINATION` 等）

- **影响范围**：
  - **不改造**：React 标准属性（如 `dangerouslySetInnerHTML`）、配置对象、枚举值映射
  - **改造范围**：仅限 IPC 接口相关的类型字段

## Capabilities

### New Capabilities

无。本次变更不引入新功能，仅统一命名风格。

### Modified Capabilities

无。命名风格变更属于实现细节，不影响现有能力的需求规范。

## Impact

- **后端**：
  - Entity：`accounting_record`, `accounting_book`, `attachment`, `chat_message`, `chat_session`
  - DTO：`services/accounting_book/dto/mod.rs`, `services/accounting/dto/mod.rs`, `services/chat/dto/mod.rs`

- **前端**：
  - 类型定义：`api/commands/accounting/type.ts`, `api/commands/accounting-book/type.ts`, `api/commands/attachment/type.ts`, `api/commands/chat/type.ts`, `api/shared/types.ts`
  - 使用点：`pages/books/*.tsx`, `lib/chat-tools.ts` 等所有 IPC 调用处

- **兼容性**：**BREAKING** - 前端必须同步更新所有字段引用，否则类型检查和运行时会出错

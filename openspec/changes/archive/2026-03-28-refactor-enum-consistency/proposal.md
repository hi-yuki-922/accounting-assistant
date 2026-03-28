## Why

当前前后端枚举实现存在严重的不一致问题，导致 IPC 接口通信失败和前端类型比较异常。后端序列化返回英文枚举名称（如 "Income"），但数据库存储中文值（如 "收入"），前端期望接收中文而实际收到英文，形成混乱的数据流转链路。这个问题阻碍了正常的开发和测试，需要立即重构。

## Rationale

### 枚举结构现代化

将前端枚举从 TypeScript `enum` 改为对象字面量常量 + type 模式，具有以下优势：

1. **更好的类型推断**: 自动推导为字符串联合类型（`'Income' | 'Expenditure' | ...`），提供更精确的类型检查
2. **更好的 tree-shaking**: 对象字面量比 enum 更容易被打包工具优化，减少最终包体积
3. **避免 enum 已知问题**:
   - 避免双向映射导致的运行时混淆
   - 避免序列化/反序列化时的边界情况
   - 消除编译时和运行时行为的不一致
4. **更灵活的结构**: 可以轻松添加元数据、辅助方法或验证逻辑
5. **完全向后兼容**: 所有现有用法（类型注解、运行时访问、比较、switch）都能正常工作

这个重构与当前的枚举英文化工作紧密相关，趁此机会一并实施，可以避免后续重复修改，同时提升代码质量。

## What Changes

**后端 (Rust):**
- **BREAKING**: 修改枚举的 `FromStr` 实现，从中文字符串解析改为英文字符串解析
- **BREAKING**: 修改枚举的 `as_str()` 方法，从返回中文字符串改为返回英文字符串
- 保留 `Display` trait，strum 自动返回英文枚举名称
- 更新所有测试用例中的枚举字符串字面量（中文 → 英文）

**前端 (TypeScript):**
- **BREAKING**: 重构枚举定义结构，从 TypeScript enum 改为对象字面量常量 + type 模式
  - 使用 `as const` 创建只读对象字面量
  - 通过 `typeof` 推导字符串联合类型
  - 示例：
    ```typescript
    // 旧方式：
    export enum AccountingType { Income = 'Income', ... }

    // 新方式：
    export const AccountingType = { Income: 'Income', ... } as const;
    export type AccountingType = typeof AccountingType[keyof typeof AccountingType];
    ```
- **BREAKING**: 枚举值从中文字符串改为英文字符串
- 新增 `DISPLAY_TEXT` 常量对象，存储枚举到中文显示文本的映射
- 修改所有显示函数（`getAccountingTypeLabel` 等）使用 `DISPLAY_TEXT`

**数据库:**
- 删除现有数据库，让 SeaORM 自动重新创建表结构（开发环境）
- 枚举字段存储值从中文变为英文

## Capabilities

### New Capabilities
无新增能力，本次为纯技术重构。

### Modified Capabilities
- `accounting-service`: 枚举解析和验证需求变更，需要更新 delta spec。枚举值从中文变为英文影响解析和验证行为。
- `record-query-filters`: 枚举值定义变更，需要更新 delta spec。查询过滤条件中使用的枚举值从中文变为英文。

## Impact

**后端影响:**
- `src-tauri/src/enums/accounting.rs` - 枚举核心实现
- `src-tauri/tests/services/accounting_test.rs` - 29+ 测试用例需要更新枚举字符串
- `src-tauri/tests/services/accounting_book_test.rs` - 部分测试用例需要更新

**前端影响:**
- `src/api/commands/accounting/enums.ts` - 枚举定义结构重构 + 显示文本映射
- `src/api/commands/accounting/type.ts` - DTO 类型定义保持不变（类型推导后仍有效）
- `src/pages/books/components/record-list-table.tsx` - 显示逻辑需要适配
- `src/pages/books/components/record-filter.tsx` - 筛选器组件需要适配
- `src/pages/books/book-detail-page.tsx` - 类型注解无需修改

**数据库影响:**
- `core.sqlite` - 开发环境数据库需要重建
- 所有枚举字段的数据类型保持不变，但存储内容从中文变为英文

**API 兼容性:**
- **BREAKING**: IPC 接口枚举值从中文变为英文，前端调用方需同步更新
- **BREAKING**: 数据库枚举字段存储值从中文变为英文，需要重建数据库

**依赖影响:**
- 无外部依赖变化
- 不影响其他服务的接口契约

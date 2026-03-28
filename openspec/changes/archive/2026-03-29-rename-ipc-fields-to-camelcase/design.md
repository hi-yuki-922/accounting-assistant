## Context

当前项目使用 Tauri 2.0 进行前后端 IPC 通信，Rust 后端遵循 snake_case 命名约定，而前端 JavaScript/TypeScript 社区标准是 camelCase。现有代码中，前端 IPC 类型定义被迫使用 snake_case 来匹配后端字段，这导致：

1. 代码风格不一致，前端开发者需要在不同场景下切换命名风格
2. 降低代码可读性和可维护性
3. 违反 JavaScript/TypeScript 社区最佳实践

serde 库提供了 `#[serde(rename_all = "camelCase")]` 属性，可以自动处理命名风格的双向转换：
- 序列化：Rust 的 `book_id` → JSON 的 `bookId`
- 反序列化：JSON 的 `bookId` → Rust 的 `book_id`

**约束条件：**
- Rust 内部代码保持 snake_case 不变（符合 Rust 社区约定）
- 前端类型定义和使用改为 camelCase（符合 JavaScript/TypeScript 约定）
- 全大写 SNAKE_CASE 常量不变（如配置对象、枚举映射）
- 必须一次性全量切换，避免兼容性问题

## Goals / Non-Goals

**Goals:**

1. 统一前后端命名风格，各自遵循社区最佳实践
2. 利用 serde 的自动命名转换功能，简化前后端类型同步
3. 保持 Rust 后端代码的 snake_case 约定不变
4. 前端 IPC 相关代码全部使用 camelCase

**Non-Goals:**

1. 不改造全大写 SNAKE_CASE 常量（如 `DEFAULT_BOOK_ID`、`PAGINATION`）
2. 不改造 React 标准属性（如 `dangerouslySetInnerHTML`）
3. 不引入自动类型生成工具（如 specta）
4. 不影响数据库存储的字段命名（数据库表字段保持不变）

## Decisions

### 决策 1：使用 `#[serde(rename_all = "camelCase")]` 而非手动字段映射

**选择：** 在结构体层面添加 `#[serde(rename_all = "camelCase")]`

**理由：**
- 一次性应用，减少重复代码
- 自动处理所有字段，包括新增字段
- Rust 代码保持 snake_case，符合 Rust 社区约定
- 语义清晰，易于理解和维护

**替代方案（未采用）：**
- 逐字段使用 `#[serde(rename = "...")]`：
  - 优点：可以精细控制每个字段的转换
  - 缺点：代码冗余，易遗漏，维护成本高

### 决策 2：全量切换而非渐进式迁移

**选择：** 一次性改造所有相关代码

**理由：**
- 避免维护两套命名风格，增加复杂度
- 利用 TypeScript 编译时检查确保全面覆盖
- 依赖关系清晰，避免部分转换导致的运行时错误
- 测试验证更简单，一次性验证所有功能

**替代方案（未采用）：**
- 渐进式迁移：
  - 优点：风险分散，可回滚
  - 缺点：需要维护两套类型，增加开发负担，容易遗漏

### 决策 3：排除全大写常量

**选择：** 保持所有全大写 SNAKE_CASE 常量不变

**理由：**
- 常量命名约定与接口字段不同，不应混淆
- 全大写常量在 JavaScript/TypeScript 中是广泛接受的约定
- 配置对象、枚举映射等使用大写有清晰的语义区分
- 减少改造范围，降低风险

**涉及文件：**
- `lib/constants.ts`：所有导出常量
- `api/commands/accounting-book/type.ts`：`DEFAULT_BOOK_ID`
- `config/book-icons.ts`：`DEFAULT_BOOK_ICON`、`BOOK_ICONS`
- `lib/ai-provider.ts`：`SUPPORTED_MODELS`

### 决策 4：chat_message 的 lowercase 改为 camelCase

**选择：** 将 `chat_message::Model` 的 `#[serde(rename_all = "lowercase")]` 改为 `camelCase`

**理由：**
- 统一所有 IPC 接口的命名风格
- 保持代码一致性
- lowercase 不是 JavaScript/TypeScript 的常见约定

**需要评估：**
- 是否有其他系统依赖 lowercase 格式的消息字段
- 如有，需要相应调整

## Risks / Trade-offs

### 风险 1：前端引用遗漏导致运行时错误

**描述：** 某些使用 IPC 类型的地方可能遗漏字段名更新，导致访问 `undefined`。

**缓解措施：**
- 利用 TypeScript 编译时检查，全面更新所有引用
- 运行端到端测试，验证所有 IPC 调用
- 分模块测试，逐步验证每个功能

### 风险 2：第三方依赖或外部系统集成受影响

**描述：** 如果有外部系统依赖特定的 JSON 字段格式，变更会导致集成失败。

**缓解措施：**
- 检查是否有外部 API 导出或导入依赖 IPC 字段格式
- 如有，需要提供适配层或文档说明
- 搜索代码库中的 `JSON.stringify` 和序列化相关代码

### 风险 3：数据库迁移风险（虽然不改造数据库）

**描述：** 虽然数据库字段名不变，但如果现有代码依赖字段名的字符串表示，可能出现问题。

**缓解措施：**
- 确认数据库字段名不受影响
- 检查是否有动态字段名访问（如反射）
- 数据库层面的查询和迁移脚本保持不变

### 权衡：一次全量切换 vs 渐进式迁移

**权衡：**
- 全量切换：实施复杂但维护简单，测试验证一次完成
- 渐进式迁移：实施简单但维护复杂，需要长期兼容

**选择：** 全量切换，接受短期复杂度以换取长期可维护性

## Migration Plan

### 阶段 1：后端改造

**步骤：**

1. **Entity 层改造**（优先级：高）
   - `entity/accounting_record.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `entity/accounting_book.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `entity/attachment.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `entity/chat_message.rs`：将 `rename_all = "lowercase"` 改为 `"camelCase"`
   - `entity/chat_session.rs`：添加 `#[serde(rename_all = "camelCase")]`

2. **DTO 层改造**（优先级：高）
   - `services/accounting_book/dto/mod.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `services/accounting/dto/mod.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `services/chat/dto/mod.rs`：添加 `#[serde(rename_all = "camelCase")]`
   - `services/attachment/dto/mod.rs`：验证已存在，如无则添加

3. **后端测试验证**
   ```bash
   cd src-tauri
   cargo test
   cargo clippy
   ```

**验证标准：**
- 所有测试通过
- 无 clippy 警告
- 序列化/反序列化测试验证字段名正确

### 阶段 2：前端类型定义改造

**步骤：**

1. **类型定义改造**（优先级：高）
   - `api/commands/accounting/type.ts`：所有小写 snake_case → camelCase
   - `api/commands/accounting-book/type.ts`：所有小写 snake_case → camelCase
   - `api/commands/attachment/type.ts`：所有小写 snake_case → camelCase
   - `api/commands/chat/type.ts`：所有小写 snake_case → camelCase
   - `api/shared/types.ts`：所有小写 snake_case → camelCase

2. **前端编译检查**
   ```bash
   pnpm build  # 运行 tsc 类型检查
   ```

**验证标准：**
- TypeScript 编译无错误（会有大量类型不匹配，这是预期的）
- 记录所有类型错误，用于指导下一步代码改造

### 阶段 3：前端使用点改造

**步骤：**

1. **批量字段名替换**（优先级：高）
   - 搜索并替换所有使用旧字段名的代码
   - 优先级按使用频率排序

2. **模块化改造**（推荐顺序）
   - `pages/books/book-detail-page.tsx`
   - `pages/books/books-page.tsx`
   - `pages/books/components/record-list-table.tsx`
   - `lib/chat-tools.ts`
   - 其他组件和 hooks

3. **前端测试**
   ```bash
   pnpm build
   pnpm dev  # 手动测试关键功能
   ```

**验证标准：**
- TypeScript 编译无错误
- 应用启动正常
- 所有 IPC 调用功能正常

### 阶段 4：端到端测试和修复

**步骤：**

1. **启动完整应用**
   ```bash
   pnpm tauri dev
   ```

2. **功能测试清单**
   - [ ] 账本管理：创建、查询、更新、删除
   - [ ] 记账记录：添加、修改、过账、查询
   - [ ] 附件管理：上传、查询、下载、删除
   - [ ] 聊天功能：创建会话、发送消息、查询记录

3. **修复发现的问题**
   - 记录所有测试失败
   - 分类修复
   - 重新测试验证

**验证标准：**
- 所有核心功能正常工作
- 无控制台错误
- 前后端数据传输正常

### 回滚策略

**触发条件：**
- 核心功能严重受损，无法快速修复
- 发现未预期的架构问题，需要重新评估

**回滚步骤：**
```bash
# 后端回滚
git checkout <previous-commit>

# 前端回滚
git checkout <previous-commit>
```

**恢复验证：**
- 确认应用回退到稳定状态
- 所有功能恢复正常

## Open Questions

1. **chat_message 的 lowercase 改为 camelCase 的影响范围**
   - 是否有其他系统依赖 lowercase 格式？
   - 需要通知哪些团队或文档？

2. **是否有自动化测试覆盖所有 IPC 调用？**
   - 如无，是否需要在改造前补充测试？

3. **是否有性能影响？**
   - serde 的命名转换是否有可测量的性能开销？
   - 是否需要进行性能基准测试？

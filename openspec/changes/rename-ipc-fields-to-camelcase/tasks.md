## 1. 后端 Entity 层改造

- [x] 1.1 为 `entity/accounting_record.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 1.2 为 `entity/accounting_book.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 1.3 为 `entity/attachment.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 1.4 修改 `entity/chat_message.rs` 将 `#[serde(rename_all = "lowercase")]` 改为 `"camelCase"`
- [x] 1.5 为 `entity/chat_session.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 1.6 运行 `cargo test` 验证 Entity 层改造
- [x] 1.7 运行 `cargo clippy` 检查代码质量

## 2. 后端 DTO 层改造

- [x] 2.1 为 `services/accounting_book/dto/mod.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 2.2 为 `services/accounting/dto/mod.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 2.3 为 `services/chat/dto/mod.rs` 添加 `#[serde(rename_all = "camelCase")]`
- [x] 2.4 验证 `services/attachment/dto/mod.rs` 已存在 `#[serde(rename_all = "camelCase")]`
- [x] 2.5 运行 `cargo test` 验证 DTO 层改造
- [x] 2.6 运行 `cargo clippy` 检查代码质量

## 3. 前端类型定义改造

- [x] 3.1 改造 `api/commands/accounting/type.ts` 所有小写 snake_case 字段为 camelCase
- [x] 3.2 改造 `api/commands/accounting-book/type.ts` 所有小写 snake_case 字段为 camelCase
- [x] 3.3 改造 `api/commands/attachment/type.ts` 所有小写 snake_case 字段为 camelCase
- [x] 3.4 改造 `api/commands/chat/type.ts` 所有小写 snake_case 字段为 camelCase
- [x] 3.5 改造 `api/shared/types.ts` 所有小写 snake_case 字段为 camelCase
- [x] 3.6 运行 `pnpm build` 进行 TypeScript 类型检查

## 4. 前端使用点改造 - 账本管理

- [x] 4.1 改造 `pages/books/book-detail-page.tsx` 所有 IPC 字段引用
- [x] 4.2 改造 `pages/books/books-page.tsx` 所有 IPC 字段引用
- [x] 4.3 改造 `pages/books/components/record-list-table.tsx` 所有 IPC 字段引用
- [x] 4.4 改造账本管理相关 hooks 中的字段引用

## 5. 前端使用点改造 - 聊天功能

- [x] 5.1 改造 `lib/chat-tools.ts` 所有 IPC 字段引用
- [x] 5.2 改造聊天相关 hooks 中的字段引用
- [x] 5.3 改造聊天相关组件中的字段引用

## 6. 前端使用点改造 - 其他模块

- [x] 6.1 搜索并改造所有剩余使用 IPC 字段的 TypeScript 文件
- [x] 6.2 搜索并改造所有剩余使用 IPC 字段的 TSX 组件
- [x] 6.3 运行 `pnpm build` 验证所有改造完成

## 7. 端到端测试

- [ ] 7.1 启动完整应用 `pnpm tauri dev`
- [ ] 7.2 测试账本管理功能：创建、查询、更新、删除账本
- [ ] 7.3 测试记账记录功能：添加、修改、过账、查询记录
- [ ] 7.4 测试附件管理功能：上传、查询、下载、删除附件
- [ ] 7.5 测试聊天功能：创建会话、发送消息、查询记录
- [ ] 7.6 检查浏览器控制台，确保无错误日志
- [ ] 7.7 验证所有数据传输前后端字段名匹配

## 8. 代码审查和清理

- [ ] 8.1 运行 `pnpm dlx ultracite check` 检查前端代码质量
- [ ] 8.2 运行 `cargo clippy` 检查后端代码质量
- [ ] 8.3 审查所有修改的代码，确保无遗漏或误改
- [ ] 8.4 确认全大写常量（如 `DEFAULT_BOOK_ID`、`PAGINATION`）未被修改

## 验收标准

所有任务完成后，应满足以下标准：

1. **后端**
   - 所有 Entity 和 DTO 都有 `#[serde(rename_all = "camelCase")]`
   - 所有测试通过 (`cargo test`)
   - 无 clippy 警告

2. **前端**
   - 所有 IPC 相关类型使用 camelCase
   - TypeScript 编译无错误
   - 全大写常量保持不变

3. **功能**
   - 所有核心功能正常工作
   - 前后端数据传输正确
   - 无控制台错误

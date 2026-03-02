# 附件管理服务目录结构重构设计

## Context

**当前状态：**
附件管理服务的代码当前以扁平结构存在于 `src-tauri/src/services/` 根目录下：
- `attachment.rs` - 包含 `AttachmentService` 结构体及其方法
- `attachment_storage.rs` - 包含 `AttachmentStorage` 结构体及其方法

DTO（Data Transfer Object）定义直接位于 `commands/attachment.rs` 中，与 Tauri 命令处理混在一起。

**记账服务参考结构：**
`src-tauri/src/services/accounting/` 目录结构：
```
accounting/
├── mod.rs          # 服务主文件，包含主要业务逻辑函数
└── dto/
    └── mod.rs      # DTO 定义及转换逻辑
```

**约束条件：**
- 这是一个纯代码重构，不能改变任何功能行为
- 必须保持与现有代码风格一致
- 所有导入路径需要正确更新
- 不能影响其他模块对附件服务的引用

## Goals / Non-Goals

**Goals：**
- 统一代码组织结构，使附件服务与记账服务保持一致
- 提高代码可维护性和可读性
- 分离 DTO 定义到专门的模块中
- 为未来扩展预留清晰的目录结构

**Non-Goals：**
- 不改变任何功能逻辑
- 不修改数据库 schema
- 不影响 API 接口
- 不重构其他服务模块

## Decisions

### 决策 1：目录结构采用与 accounting 服务相同的模式

**选择：** 采用 `services/attachment/` 目录，包含 `mod.rs`、`storage.rs` 和 `dto/mod.rs`

**理由：**
- 与现有 `accounting` 服务保持一致，降低认知负担
- 清晰分离关注点：主服务、存储管理、数据传输对象
- 便于未来扩展（如添加更多子模块）

**替代方案考虑：**
- 方案 A：保持扁平结构，仅分离 DTO - 未解决根本的组织问题
- 方案 B：创建更复杂的嵌套结构 - 当前功能规模下过于复杂

### 决策 2：storage.rs 独立文件

**选择：** 将 `AttachmentStorage` 放在独立的 `storage.rs` 文件中

**理由：**
- `AttachmentStorage` 负责文件系统操作，与数据库操作职责分离
- 便于单元测试（可以 mock 存储层）
- 如果未来有其他存储实现（如云存储），易于扩展

### 决策 3：DTO 从 commands 层分离

**选择：** 将 `AttachmentInfo` 从 `commands/attachment.rs` 移动到 `services/attachment/dto/mod.rs`

**理由：**
- DTO 属于服务层的数据结构，不应与命令处理耦合
- 便于服务层测试时复用 DTO
- 符合 `accounting` 服务的模式

## Risks / Trade-offs

### 风险 1：导入路径更新遗漏
**描述：** 更新导入路径时可能遗漏某些文件，导致编译错误
**缓解措施：**
- 使用 `cargo check` 验证所有导入是否正确
- 重构后运行完整测试套件确保功能正常

### 风险 2：模块依赖循环
**描述：** 模块重新组织可能导致循环依赖
**缓解措施：**
- 保持清晰的依赖层次：commands → services → entity
- 避免在下层模块引用上层模块

### 权衡：移动文件的原子性
**描述：** 移动文件和更新引用无法在单次提交中原子完成
**权衡：**
- 分步实施：先创建新文件，再更新引用，最后删除旧文件
- 优点：每个步骤都可验证，降低回滚风险
- 缺点：需要多次编译验证

## Migration Plan

1. **创建新目录结构**
   - 创建 `src-tauri/src/services/attachment/` 目录
   - 创建 `src-tauri/src/services/attachment/dto/` 子目录

2. **创建新模块文件**
   - 创建 `services/attachment/dto/mod.rs`，复制 DTO 定义
   - 创建 `services/attachment/storage.rs`，复制 `AttachmentStorage`
   - 创建 `services/attachment/mod.rs`，复制 `AttachmentService` 并更新导入

3. **更新模块引用**
   - 更新 `services/mod.rs` 的模块声明
   - 更新 `commands/attachment.rs` 的导入路径

4. **验证编译**
   - 运行 `cargo check` 确保无编译错误
   - 运行 `cargo test` 确保测试通过

5. **清理旧文件**
   - 删除 `services/attachment.rs`
   - 删除 `services/attachment_storage.rs`

## Open Questions

无 - 所有技术决策已明确。

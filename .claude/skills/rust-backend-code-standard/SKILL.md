---
name: rust-backend-code-standard
description: |
  Tauri Rust 后端代码编写规范。当用户编写或修改 src-tauri/src/ 目录下的 Rust 代码时必须使用此 skill。
  触发场景包括：创建新的 entity、service、command、enum、sidecar 相关代码，编写数据库操作，
  处理金额计算，定义 DTO，实现异步函数，编写错误处理逻辑等。遵循 Entity-First 原则、分层架构、
  类型安全和中文注释规范。
---

# Rust 后端代码规范

本 skill 指导记账助手项目的 Tauri Rust 后端代码编写，确保代码一致性、可维护性和可读性。

## 核心原则

1. **Entity-First**：实体定义优先，自动同步数据库架构
2. **分层架构**：命令层 → 服务层 → 数据层，职责清晰
3. **类型安全**：充分利用 Rust 类型系统，金额必须使用 `Decimal`
4. **错误处理**：显式使用 `Result` 类型，避免 `panic`
5. **异步优先**：I/O 操作全部使用 `async/await`
6. **中文注释**：使用中文编写注释和文档
7. **Tauri 集成**：充分利用 Tauri State 机制进行依赖注入

## 项目结构

```
src-tauri/src/
├── commands/           # Tauri 命令处理器 (IPC 层)
├── services/           # 业务逻辑层
│   └── {domain}/
│       ├── mod.rs
│       └── dto/mod.rs  # 数据传输对象
├── entity/             # Sea-ORM 实体定义
├── db/                 # 数据库连接管理
├── enums/              # 应用枚举定义
├── sidecar/            # Sidecar 进程通信
├── lib.rs              # 库入口
└── main.rs             # 二进制入口
```

## 规范文档索引

根据具体需求，查阅以下子文档：

| 需求场景 | 参考文档 |
|---------|---------|
| 理解整体架构 | `references/architecture.md` |
| 组织模块结构 | `references/module-organization.md` |
| 命名类型/函数/变量 | `references/naming-conventions.md` |
| 代码格式化 | `references/formatting.md` |
| 处理错误 | `references/error-handling.md` |
| 编写异步代码 | `references/async-programming.md` |
| 数据库操作 | `references/database-operations.md` |
| 定义实体 | `references/entity-layer.md` |
| 编写服务 | `references/service-layer.md` |
| 编写命令 | `references/command-layer.md` |
| 定义枚举 | `references/enum-definitions.md` |
| Sidecar 集成 | `references/sidecar-management.md` |
| 类型选择 | `references/type-system.md` |
| 编写注释 | `references/comment-standards.md` |
| 最佳实践 | `references/best-practices.md` |

## 必须遵守的规则

### 金额处理

```rust
// ✅ 正确：使用 Decimal
#[sea_orm(column_type = "Decimal(Some((19, 4)))")]
pub amount: Decimal,

// ❌ 错误：永远不要使用浮点数
pub amount: f64,  // 禁止！
```

### 主键类型

```rust
// ✅ 正确：使用 i64，禁用自增
#[sea_orm(primary_key, auto_increment = false)]
pub id: i64,
```

### 错误处理

```rust
// ✅ 正确：使用 Result 和 ? 传播
pub async fn add_record(&self, input: Dto) -> Result<Model, Box<dyn std::error::Error>> {
    let record = ...?;
    Ok(record)
}

// ❌ 错误：避免 unwrap
let record = operation().await.unwrap();  // 禁止！
```

### 服务结构

```rust
#[derive(Debug)]
pub struct XxxService {
    db: DatabaseConnection,
}

impl XxxService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
```

### Tauri 命令

```rust
#[tauri::command]
pub async fn xxx_command(
    service: State<'_, XxxService>,
    input: XxxDto,
) -> Result<Model, String> {
    service.xxx_method(input)
        .await
        .map_err(|e| e.to_string())
}
```

## 输出要求

1. 所有对话和文档使用简体中文
2. 代码注释优先使用中文
3. 技术文档使用 Markdown 格式
4. 金额类型必须使用 `rust_decimal::Decimal`
5. 实体主键使用 `i64` (Snowflake 风格)
6. 永远不要使用浮点数进行金融计算

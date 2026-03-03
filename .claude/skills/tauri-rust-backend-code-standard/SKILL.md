---
name: tauri-rust-backend-code-standard
description: Coding conventions to follow when writing Tauri Rust backend code
---

# Tauri Rust 后端开发代码规范

## 目录

- [1. 语言规范](#1-语言规范)
- [2. 项目结构](./project-structure/SKILL.md)
- [3. 命名规范](./naming-conventions/SKILL.md)
- [4. 服务层开发规范](./service-layer-development/SKILL.md)
- [5. 异步编程](./asynchronous-programming/SKILL.md)

## 1. 语言规范

### 1.1 注释语言
- **必须使用简体中文**编写所有注释、文档和用户可见的错误信息
- 关键逻辑的代码注释应当详细说明业务逻辑和技术实现
- 公共 API 必须提供文档注释（`///`）

```rust
/// 创建默认账本（未归类账目）
/// 检查默认账本是否已存在，如果不存在则创建
async fn create_default_book(db: &sea_orm::DatabaseConnection) -> Result<(), Box<dyn std::error::Error>> {
    // 检查默认账本是否已存在
    let existing = crate::entity::accounting_book::Entity::find()
        .filter(crate::entity::accounting_book::Column::Id.eq(10000001))
        .one(db)
        .await?;
    // ...
}
```

### 1.2 用户可见信息
- 错误提示信息、日志输出必须使用中文
- 前端接收的 JSON 数据中的字符串字段使用中文（如枚举值显示）


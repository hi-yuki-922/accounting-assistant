---
name: asynchronous-programming
description: Asynchronous Programming Specification
---

# 异步编程

## 函数签名
所有涉及 IO 操作的函数必须是异步的：

```rust
pub async fn add_accounting_record(
    input: AddAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}
```

## Tauri 命令
Tauri 命令必须是异步的：

```rust
#[command]
pub async fn add_accounting_record(input: AddAccountingRecordDto) -> Result<..., String> {
    // ...
}
```

## 数据库连接

使用全局连接池，每次操作获取连接：

```rust
pub async fn add_accounting_record(...) -> Result<Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;  // 获取数据库连接

    // 使用 &*db 获取 DatabaseConnection 引用
    let inserted_record = new_record.insert(&*db).await?;
    Ok(inserted_record)
}
```

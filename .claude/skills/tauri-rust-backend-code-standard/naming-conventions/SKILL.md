---
name: naming-conventions
descriptions: Tauri Rust backend project code naming conventions
---

## 命名规范

### 基本规则

- **函数和方法**：使用 `snake_case`
- **类型（结构体、枚举）**：使用 `PascalCase`
- **常量和静态变量**：使用 `SCREAMING_SNAKE_CASE`
- **模块名**：使用 `snake_case`

```rust
// 函数命名
pub async fn add_accounting_record(input: AddAccountingRecordDto) -> Result<Model, String> {}

// 类型命名
pub struct AddAccountingRecordDto {}
pub enum AccountingType {}

// 常量命名
const SIDECAR_EXECUTABLE: &str = "bun-sidecar-x86_64-pc-windows-mscv.exe";
```

### 命令命名

- Tauri 命令函数使用动词+名词形式，如 `add_accounting_record`、`modify_accounting_record`
- 服务层函数使用简洁的动词形式，如 `create`、`delete`、`query`

### 数据库表命名

- 表名使用 `snake_case`，单数形式（Sea-ORM 约定）
- 列名使用 `snake_case`

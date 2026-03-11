# 命名规范

## 结构体/枚举

使用 **PascalCase**：

```rust
// 服务
pub struct AccountingService { }
pub struct AttachmentService { }

// 枚举
pub enum AccountingType { }
pub enum AccountingChannel { }
pub enum AccountingRecordState { }

// DTO
pub struct AddAccountingRecordDto { }
pub struct ModifyAccountingRecordDto { }

// 实体 Model
pub struct Model {
    // ...
}
```

## 函数/方法

使用 **snake_case**：

```rust
// CRUD 操作标准命名
pub fn add_record(&self, input: Dto) { }       // 创建
pub fn get_record(&self, id: i64) { }          // 获取单个
pub fn query_records(&self, ...) { }           // 查询列表
pub fn modify_record(&self, input: Dto) { }    // 更新
pub fn delete_record(&self, id: i64) { }       // 删除

// 异步函数
pub async fn create_attachment(&self, ...) { }
pub async fn query_attachments(&self, ...) { }

// 初始化函数
pub fn new(db: DatabaseConnection) -> Self { }
pub fn with_default() -> Result<Self> { }

// 实体方法
pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, ...> { }
```

## 常量

使用 **SCREAMING_SNAKE_CASE**：

```rust
const SIDECAR_EXECUTABLE: &str = "bun-sidecar-x86_64-pc-windows-mscv.exe";
const DEFAULT_BOOK_ID: i64 = 2021010100001;
const MAX_PAGE_SIZE: i64 = 100;
```

## 模块和文件

使用 **snake_case**：

```
commands/
├── mod.rs
├── accounting.rs
├── accounting_book.rs
└── attachment.rs

services/
├── mod.rs
├── accounting/
│   ├── mod.rs
│   └── dto/
│       └── mod.rs
└── attachment/

entity/
├── mod.rs
├── accounting_record.rs
├── accounting_record_seq.rs
└── attachment.rs
```

## 结构体字段

使用 **snake_case**：

```rust
pub struct Model {
    pub id: i64,
    pub amount: Decimal,
    pub record_time: NaiveDateTime,
    pub accounting_type: AccountingType,
    pub title: String,
    pub channel: AccountingChannel,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub create_at: NaiveDateTime,
    pub state: AccountingRecordState,
    pub book_id: Option<i64>,
}
```

## 方法命名约定

### 服务层方法

| 操作类型 | 方法名前缀 | 示例 |
|---------|-----------|------|
| 创建 | `add_`, `create_` | `add_record`, `create_attachment` |
| 查询单个 | `get_`, `find_` | `get_record`, `find_by_id` |
| 查询列表 | `query_`, `list_` | `query_attachments`, `list_records` |
| 更新 | `modify_`, `update_` | `modify_record`, `update_book` |
| 删除 | `delete_`, `remove_` | `delete_attachment`, `remove_record` |
| 检查 | `is_`, `has_`, `can_` | `is_running`, `has_records` |

### 命令层函数

与 Tauri 前端调用的函数名保持一致：

```rust
#[tauri::command]
pub async fn add_accounting_record(...) { }

#[tauri::command]
pub async fn query_attachments(...) { }
```

## 类型参数命名

使用单个大写字母或描述性名称：

```rust
// 常见约定
T  // 类型
E  // 错误
K  // 键
V  // 值

// 描述性
pub struct Service<D> { }
pub fn process<Input, Output>(input: Input) -> Output { }
```

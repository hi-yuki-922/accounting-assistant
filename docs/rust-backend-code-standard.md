# Rust 后端代码规范

本文档定义了记账助手项目的 Rust 后端代码编写规范，旨在保持代码一致性、可维护性和可读性。

## 目录

- [项目架构](#项目架构)
- [模块组织](#模块组织)
- [命名规范](#命名规范)
- [代码格式化](#代码格式化)
- [错误处理](#错误处理)
- [异步编程](#异步编程)
- [数据库操作](#数据库操作)
- [实体层 (Entity)](#实体层-entity)
- [服务层 (Services)](#服务层-services)
- [命令层 (Commands)](#命令层-commands)
- [枚举定义](#枚举定义)
- [Sidecar 进程管理](#sidecar-进程管理)
- [类型系统](#类型系统)
- [注释规范](#注释规范)
- [最佳实践](#最佳实践)

---

## 项目架构

本项目采用分层架构设计：

```
Frontend (Vue 3 + TypeScript)
    ↓ Tauri IPC Commands
Commands Layer (Rust)
    ↓ Service Layer
Business Logic Layer (Services)
    ↓ Data Access Layer
Database Layer (SQLite via Sea-ORM)
```

### 目录结构

```
src-tauri/src/
├── commands/           # Tauri 命令处理器 (IPC 层)
├── services/           # 业务逻辑层
│   ├── accounting/
│   │   ├── mod.rs
│   │   └── dto/       # 数据传输对象
│   ├── attachment/
│   └── accounting_book/
├── entity/             # Sea-ORM 实体定义 (entity-first)
├── db/                 # 数据库连接和池管理
├── enums/              # 应用枚举定义
├── sidecar/            # Sidecar 进程通信层
├── lib.rs              # 库入口和应用初始化
└── main.rs             # 二进制入口
```

---

## 模块组织

### 模块声明

每个子目录应包含 `mod.rs` 文件作为模块声明：

```rust
// commands/mod.rs
mod accounting;
mod attachment;
mod config;
mod accounting_book;
```

### 公共导出

使用 `pub use` 重新导出常用类型，简化调用路径：

```rust
// services/mod.rs
pub mod accounting;
pub mod attachment;
pub mod accounting_book;

pub use accounting::AccountingService;
pub use accounting_book::AccountingBookService;
pub use attachment::AttachmentService;
```

### 服务初始化

服务通过 `Tauri::app.manage()` 进行依赖注入：

```rust
pub fn init_services(
    app: &App,
    db: &DatabaseConnection,
    rt: &tokio::runtime::Runtime
) -> Result<(), Box<dyn std::error::Error>> {
    let accounting_service = AccountingService::new(db.clone());
    app.manage(accounting_service);
    Ok(())
}
```

---

## 命名规范

### 结构体/枚举

- **PascalCase**：结构体和枚举类型名称
  ```rust
  pub struct AccountingService { }
  pub enum AccountingType { }
  ```

### 函数/方法

- **snake_case**：函数和方法名称
  ```rust
  pub fn add_record(&self, input: AddAccountingRecordDto) { }
  pub async fn create_attachment(&self, ...) { }
  ```

### 常量

- **SCREAMING_SNAKE_CASE**：全局常量
  ```rust
  const SIDECAR_EXECUTABLE: &str = "bun-sidecar-x86_64-pc-windows-mscv.exe";
  ```

### 模块

- **snake_case**：模块和文件名
  ```
  commands/
  accounting/
  entity/
  ```

### 字段

- **snake_case**：结构体字段
  ```rust
  pub struct Model {
      pub id: i64,
      pub amount: Decimal,
      pub record_time: NaiveDateTime,
  }
  ```

---

## 代码格式化

### 缩进

- 使用 **2 空格** 缩进

### 行宽

- 理想行宽：**100 字符**
- 必要时可超出，但避免过长

### 大括号

- 开括号不换行
- 空结构体使用 `{}`（单行）
- 多字段结构体/枚举使用块格式

```rust
// 好的格式
pub struct AccountingService {
    db: DatabaseConnection,
}

// 空枚举
pub enum Relation {
    AccountingBook,
}
```

### 尾随逗号

- 多行结构体、枚举、数组等使用尾随逗号

```rust
let new_record = ActiveModel {
    id: sea_orm::ActiveValue::Set(id),
    amount: sea_orm::ActiveValue::Set(amount),
    record_time: sea_orm::ActiveValue::Set(record_time),
};
```

---

## 错误处理

### 基本错误处理

使用 `Result` 类型处理可能失败的操作：

```rust
pub async fn add_record(
    &self,
    input: AddAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}
```

### 错误转换

使用 `?` 操作符和 `map_err` 转换错误：

```rust
let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
    .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;
```

### 自定义错误

为复杂模块定义自定义错误类型：

```rust
// sidecar/error.rs
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SidecarError {
    #[error("Sidecar executable not found: {0}")]
    NotFound(String),
    #[error("Failed to spawn sidecar process: {0}")]
    SpawnError(std::io::Error),
    #[error("Invalid response from sidecar: {0}")]
    InvalidResponse(String),
    #[error("Timeout waiting for response: {0}")]
    Timeout(String),
    #[error("Sidecar error: {0}")]
    SidecarError(String),
}
```

### 错误传播

在 Tauri 命令中将服务层错误转换为字符串：

```rust
#[command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.add_record(input)
        .await
        .map_err(|e| e.to_string())
}
```

---

## 异步编程

### 异步函数

所有涉及 I/O 操作的函数应为 `async` 函数：

```rust
pub async fn add_record(&self, input: AddAccountingRecordDto) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}
```

### Tokio Runtime

应用初始化时创建 Tokio 运行时：

```rust
let rt = tokio::runtime::Runtime::new().unwrap();

// 使用 block_on 运行异步代码
let db = rt.block_on(connection::init_db(&app_data_dir));
```

### 异步代码中的线程安全

使用 `Arc<Mutex<T>>` 保护共享状态：

```rust
pub struct SidecarManager {
    child: Arc<Mutex<Option<Child>>>,
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    pending_requests: Arc<Mutex<HashMap<String, mpsc::Sender<IpcResponse>>>>,
}
```

---

## 数据库操作

### 连接池管理

使用全局 `Arc<DatabaseConnection>` 管理连接池：

```rust
// db/connection.rs
pub async fn init_db(app_data_dir: &Path) -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    let db_path = app_data_dir.join("core.sqlite");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_str().ok_or("Invalid database path")?);

    let db = Database::connect(&db_url).await?;
    let db_arc = Arc::new(db);

    Ok(db_arc)
}
```

### 数据库模式

- 使用 SQLite (`sqlite:`)
- 使用 `mode=rwc` 读写创建模式
- 数据库文件名为 `core.sqlite`

### 查询构建

使用 Sea-ORM 查询构建器：

```rust
let mut query = attachment::Entity::find();

// 添加筛选条件
if let Some(name) = file_name {
    if !name.is_empty() {
        query = query.filter(attachment::Column::FileName.contains(&name));
    }
}

// 排序和分页
query = query.order_by_desc(attachment::Column::CreateAt);
query = query.limit(page_size as u64).offset(offset as u64);

let result = query.all(&self.db).await?;
```

---

## 实体层 (Entity)

### Entity-First 原则

Sea-ORM 实体优先定义，然后同步数据库架构：

```rust
// entity/accounting_record.rs
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
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

### ActiveModel 使用

使用 `ActiveModel` 进行插入和更新操作：

```rust
// 插入
let new_record = ActiveModel {
    id: sea_orm::ActiveValue::Set(id),
    amount: sea_orm::ActiveValue::Set(amount),
    // ...
};

let inserted_record = new_record.insert(&self.db).await?;

// 更新
let mut active_model: ActiveModel = record.into();
active_model.amount = sea_orm::ActiveValue::Set(new_amount);
let updated_record = active_model.update(&self.db).await?;
```

### 实体注册

在应用初始化时注册实体并同步架构：

```rust
// entity/mod.rs
pub async fn with_install_entities(db: &sea_orm::DatabaseConnection) -> Result<(), Box<dyn std::error::Error>> {
    db.get_schema_builder()
        .register(accounting_record::Entity)
        .register(accounting_record_seq::Entity)
        .register(accounting_book::Entity)
        .register(attachment::Entity)
        .sync(db)
        .await?;

    Ok(())
}
```

### 实体方法

在 `impl Model` 块中添加实体相关方法：

```rust
impl Model {
    /// 生成唯一 ID，格式为 YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        let next_seq = super::accounting_record_seq::Model::get_next_sequence(db, date_int).await?;
        let id_str = format!("{}{:05}", date_int, next_seq);

        Ok(id_str.parse::<i64>().unwrap())
    }
}
```

---

## 服务层 (Services)

### 服务结构

每个服务持有数据库连接：

```rust
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

impl AccountingService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
```

### 方法命名

- CRUD 操作使用标准命名：
  - `create_*/add_*` - 创建
  - `get_*/query_*/find_*` - 查询
  - `modify_*/update_*` - 更新
  - `delete_*/remove_*` - 删除

```rust
// 创建
pub async fn add_record(&self, input: AddAccountingRecordDto) -> Result<Model, ...>

// 查询
pub async fn query_attachments(&self, ...) -> Result<Vec<attachment::Model>, ...>

// 更新
pub async fn modify_record(&self, input: ModifyAccountingRecordDto) -> Result<Model, ...>

// 删除
pub async fn delete_attachment(&self, id: i64) -> Result<(), ...>
```

### DTO 定义

每个服务包含 `dto` 子模块定义数据传输对象：

```rust
pub mod dto;

use dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};
```

### 类型转换

在 DTO 上实现类型转换方法：

```rust
impl AddAccountingRecordDto {
    pub fn to_internal_types(&self) -> Result<(Decimal, NaiveDateTime, AccountingType, AccountingChannel), String> {
        let amount_decimal = Decimal::from_f64_retain(self.amount)
            .ok_or_else(|| "Invalid amount provided".to_string())?;

        let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;

        // ...

        Ok((amount_decimal, parsed_datetime, parsed_accounting_type, parsed_channel))
    }
}
```

### 参数验证

在服务层进行参数验证：

```rust
pub async fn create_attachment(
    &self,
    app_handle: &AppHandle,
    master_id: i64,
    file_name: String,
    file_suffix: String,
    file_size: String,
    file_content: Vec<u8>,
) -> Result<(i64, String), String> {
    // 验证参数
    if master_id <= 0 {
        return Err("主表记录 ID 必须大于 0".to_string());
    }
    if file_name.is_empty() {
        return Err("文件名不能为空".to_string());
    }

    // ...
}
```

---

## 命令层 (Commands)

### 命令定义

使用 `#[tauri::command]` 宏定义 Tauri 命令：

```rust
#[command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.add_record(input)
        .await
        .map_err(|e| e.to_string())
}
```

### 状态注入

通过 `State<'_, ServiceType>` 注入服务实例：

```rust
pub async fn create_attachment(
    app: AppHandle,
    service: State<'_, AttachmentService>,
    master_id: i64,
    file_name: String,
    // ...
) -> Result<(i64, String), String> {
    service.create_attachment(&app, master_id, file_name, ...).await
}
```

### 命令注册

在 `commands/mod.rs` 中集中注册所有命令：

```rust
pub fn with_install_tauri_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        accounting::add_accounting_record,
        accounting::modify_accounting_record,
        accounting::post_accounting_record,
        attachment::create_attachment,
        attachment::delete_attachment,
        // ...
    ])
}
```

---

## 枚举定义

### 枚举派生

使用 `strum` 和 `serde` 派生：

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingType {
    Income,
    Expenditure,
    InvestmentIncome,
    InvestmentLoss,
}
```

### 字符串解析

实现 `FromStr` trait 支持中文字符串：

```rust
impl std::str::FromStr for AccountingType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "收入" => Ok(AccountingType::Income),
            "支出" => Ok(AccountingType::Expenditure),
            "投资收益" => Ok(AccountingType::InvestmentIncome),
            "投资亏损" => Ok(AccountingType::InvestmentLoss),
            _ => Err(()),
        }
    }
}
```

### 字符串转换

提供 `as_str()` 方法转换回字符串：

```rust
impl AccountingType {
    fn as_str(&self) -> &'static str {
        match self {
            AccountingType::Income => "收入",
            AccountingType::Expenditure => "支出",
            AccountingType::InvestmentIncome => "投资收益",
            AccountingType::InvestmentLoss => "投资亏损",
        }
    }
}
```

### Sea-ORM 集成

为枚举实现必要的 Sea-ORM trait：

```rust
// TryGetable - 从查询结果获取
impl TryGetable for AccountingType {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }
}

// ValueType - 转换为数据库值
impl sea_orm::sea_query::ValueType for AccountingType {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<AccountingType>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(AccountingType).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

// From<Value> - 从枚举转换为数据库值
impl From<AccountingType> for Value {
    fn from(e: AccountingType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

// TryFromU64 - 不支持从 u64 转换
impl sea_orm::TryFromU64 for AccountingType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingType")))
    }
}
```

---

## Sidecar 进程管理

### Sidecar 结构

```rust
pub struct SidecarManager {
    executable_path: PathBuf,
    child: Arc<Mutex<Option<Child>>>,
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    response_rx: Mutex<Option<mpsc::Receiver<IpcResponse>>>,
    pending_requests: Arc<Mutex<HashMap<String, mpsc::Sender<IpcResponse>>>>,
}
```

### 进程启动/停止

```rust
impl SidecarManager {
    pub fn start(&self) -> Result<()> {
        let mut child = Command::new(&self.executable_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(SidecarError::SpawnError)?;

        // 捕获 stdin/stdout
        let stdin = child.stdin.take().ok_or_else(|| {
            SidecarError::InvalidResponse("Failed to capture stdin".to_string())
        })?;

        let stdout = child.stdout.take().ok_or_else(|| {
            SidecarError::InvalidResponse("Failed to capture stdout".to_string())
        })?;

        // 保存子进程引用
        let mut child_guard = self.child.lock().unwrap();
        *child_guard = Some(child);

        // 启动响应监听线程
        self.start_response_listener(stdout);

        Ok(())
    }

    pub fn stop(&self) -> Result<()> {
        let mut child_guard = self.child.lock().unwrap();
        if let Some(mut child) = child_guard.take() {
            child.kill()?;
        }
        Ok(())
    }
}
```

### Drop 实现

```rust
impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
```

### 命令发送与响应

```rust
pub fn send_command(&self, command: IpcCommand) -> Result<IpcResponse> {
    // 创建响应通道
    let (tx, rx) = mpsc::channel();

    // 注册请求
    {
        let mut pending = self.pending_requests.lock().unwrap();
        pending.insert(command.id.clone(), tx);
    }

    // 发送命令
    self.send_to_sidecar(&command)?;

    // 等待响应
    let response = rx.recv().map_err(|_| {
        SidecarError::Timeout(format!("No response for command {}", command.id))
    })?;

    // 清理
    {
        let mut pending = self.pending_requests.lock().unwrap();
        pending.remove(&command.id);
    }

    if response.is_success() {
        Ok(response)
    } else {
        Err(SidecarError::SidecarError(response.get_error().cloned().unwrap_or_default()))
    }
}
```

### 响应监听线程

```rust
fn start_response_listener(&self, stdout: std::process::ChildStdout) {
    let pending_requests = self.pending_requests.clone();

    thread::spawn(move || {
        let reader = BufReader::new(stdout);

        for line_result in reader.lines() {
            if let Ok(json_str) = line_result {
                if let Ok(response) = serde_json::from_str::<IpcResponse>(&json_str) {
                    let pending = pending_requests.lock().unwrap();
                    if let Some(tx) = pending.get(&response.id) {
                        let _ = tx.send(response);
                    }
                }
            }
        }
    });
}
```

---

## 类型系统

### 金额类型

使用 `rust_decimal::Decimal` 处理金额：

```rust
#[sea_orm(column_type = "Decimal(Some((19, 4)))")]
pub amount: Decimal,
```

转换时使用 `from_f64_retain`：

```rust
let amount_decimal = Decimal::from_f64_retain(self.amount)
    .ok_or_else(|| "Invalid amount provided".to_string())?;
```

**注意**：永远不要使用浮点数进行金融计算。

### 日期时间

- 数据库存储：`NaiveDateTime` (不带时区)
- 应用使用：`chrono::Local` 本地时间

```rust
use chrono::Local;

let now = Local::now().naive_local();
```

### ID 类型

- 实体主键：`i64` (Snowflake 风格 ID)
- 自增 ID：禁用 (`auto_increment = false`)

```rust
#[sea_orm(primary_key, auto_increment = false)]
pub id: i64,
```

### Option 处理

对于可为空的字段：

```rust
pub remark: Option<String>,
pub write_off_id: Option<i64>,
pub book_id: Option<i64>,
```

---

## 注释规范

### 文档注释

使用 `///` 添加文档注释：

```rust
/// 记账服务
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

/// 添加记账记录
pub async fn add_record(
    &self,
    input: AddAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}
```

### 行内注释

使用中文行内注释说明复杂逻辑：

```rust
// 验证参数
if master_id <= 0 {
    return Err("主表记录 ID 必须大于 0".to_string());
}

// 保存文件
let storage_path = AttachmentStorage::save_file(app_handle, &file_name, file_content).await?;
```

### 模块注释

使用 `//!` 添加模块级文档注释：

```rust
//! 服务模块通过 Tauri app.manage() 进行依赖注入
//! 这里只提供服务类型的导出，具体的实例管理和生命周期由 Tauri 的 State 机制处理
```

---

## 最佳实践

### 1. 避免 unwrap

使用 `?` 传播错误，而不是 `unwrap()`：

```rust
// 好的做法
let result = operation().await?;

// 避免的做法（除非确定不会失败）
let result = operation().await.unwrap();
```

### 2. 使用 Arc 共享所有权

对于需要在多个地方使用的共享资源：

```rust
let db_arc = Arc::new(db);
```

### 3. 实现默认值

为结构体提供默认值：

```rust
impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::NotSet,
            state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
            create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
            // ...
        }
    }
}
```

### 4. 分页验证

验证分页参数：

```rust
if page < 1 {
    return Err("页码必须大于 0".to_string());
}
if page_size <= 0 {
    return Err("每页数量必须大于 0".to_string());
}
```

### 5. 查询构建模式

使用流畅的查询构建链：

```rust
let mut query = Entity::find();
query = query.filter(...);
query = query.order_by_desc(...);
query = query.limit(...).offset(...);
let result = query.all(&self.db).await?;
```

### 6. 优雅降级

对于可选组件（如 sidecar），允许优雅降级：

```rust
pub fn with_default() -> Result<Self> {
    // ... 获取可执行文件路径 ...
    // 不检查是否存在，允许优雅降级
    let (response_tx, response_rx) = mpsc::channel();
    Ok(Self { ... })
}
```

### 7. 资源清理

实现 `Drop` trait 自动清理资源：

```rust
impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
```

---

## 依赖管理

### 主要依赖

```toml
[dependencies]
tauri = { version = "2", features = ["test"] }
sea-orm = { version = "2.0.0-rc.28", features = ["sqlx-sqlite", "runtime-tokio-rustls", "macros", "entity-registry", "schema-sync"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
chrono = { version = "0.4", features = ["serde"] }
rust_decimal = "1.35"
strum = { version = "0.26", features = ["derive"] }
thiserror = "1.0"
```

### 开发依赖

```toml
[dev-dependencies]
tokio-test = "0.4"
serial_test = "3.1"
tempfile = "3.12"
```

---

## 工具

### 代码格式化

```bash
cargo fmt
```

### 代码检查

```bash
cargo clippy
```

### 测试

```bash
cargo test
```

### 构建

```bash
cargo build
cargo build --release
```

---

## 总结

本规范基于项目实际代码编写，遵循以下原则：

1. **Entity-First**：实体定义优先，自动同步数据库
2. **分层架构**：清晰的命令层、服务层、数据层划分
3. **类型安全**：充分利用 Rust 类型系统，特别是金额使用 Decimal
4. **错误处理**：显式使用 Result 类型，避免 panic
5. **异步优先**：I/O 操作全部使用 async/await
6. **中文注释**：使用中文编写注释和文档
7. **Tauri 集成**：充分利用 Tauri 的 State 机制进行依赖注入

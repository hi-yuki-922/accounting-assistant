# 错误处理

## 基本错误处理

使用 `Result` 类型处理可能失败的操作：

```rust
// 服务层
pub async fn add_record(
    &self,
    input: AddAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}

// 命令层
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<Model, String> {
    service.add_record(input).await.map_err(|e| e.to_string())
}
```

## 错误转换

使用 `?` 操作符和 `map_err` 转换错误：

```rust
// 使用 map_err 转换错误信息
let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
    .map_err(|_| "日期格式无效，期望 YYYY-MM-DD HH:MM:SS".to_string())?;

// 使用 ? 自动传播
let record = Entity::find_by_id(id)
    .one(&self.db)
    .await?
    .ok_or("记录不存在".to_string())?;
```

## 常见错误处理模式

### Option 处理

```rust
// 使用 ok_or 转换 Option 为 Result
let record = Entity::find_by_id(id)
    .one(&self.db)
    .await?
    .ok_or("记录不存在".to_string())?;

// 使用 if let
if let Some(record) = existing_record {
    // 处理存在的情况
} else {
    return Err("记录不存在".into());
}
```

### 参数验证

```rust
pub async fn create_attachment(
    &self,
    master_id: i64,
    file_name: String,
) -> Result<(), String> {
    if master_id <= 0 {
        return Err("主表记录 ID 必须大于 0".to_string());
    }

    if file_name.is_empty() {
        return Err("文件名不能为空".to_string());
    }

    Ok(())
}
```

### 业务规则验证

```rust
pub async fn modify_record(&self, input: ModifyDto) -> Result<Model, Box<dyn std::error::Error>> {
    // 获取现有记录
    let record = Entity::find_by_id(input.id)
        .one(&self.db)
        .await?
        .ok_or("记录不存在")?;

    // 验证业务规则
    if record.state != RecordState::PendingPosting {
        return Err("只有待入账状态的记录可以修改".into());
    }

    // 执行更新
    // ...
}
```

## 自定义错误类型

为复杂模块定义自定义错误类型：

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum SidecarError {
    #[error("Sidecar 可执行文件未找到: {0}")]
    NotFound(String),

    #[error("启动 Sidecar 进程失败: {0}")]
    SpawnError(#[from] std::io::Error),

    #[error("Sidecar 响应无效: {0}")]
    InvalidResponse(String),

    #[error("等待响应超时: {0}")]
    Timeout(String),

    #[error("Sidecar 错误: {0}")]
    SidecarError(String),
}

pub type Result<T> = std::result::Result<T, SidecarError>;
```

### 使用自定义错误

```rust
impl SidecarManager {
    pub fn start(&self) -> Result<()> {
        let mut child = Command::new(&self.executable_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()?;  // 自动转换为 SpawnError

        let stdin = child.stdin.take()
            .ok_or_else(|| SidecarError::InvalidResponse("无法捕获 stdin".into()))?;

        Ok(())
    }
}
```

## 错误传播层级

```
服务层: Result<T, Box<dyn std::error::Error>>
    ↓ map_err()
命令层: Result<T, String>
    ↓ JSON 序列化
前端: { success: false, error: "错误信息" }
```

## 避免的做法

```rust
// ❌ 避免 unwrap
let result = operation().unwrap();

// ❌ 避免 expect（除非在初始化阶段）
let runtime = tokio::runtime::Runtime::new().expect("创建运行时失败");

// ❌ 避免 panic
if condition {
    panic!("不应该发生");
}

// ✅ 正确做法：使用 Result
let result = operation()?;

// ✅ 正确做法：初始化阶段可用 expect
let db = rt.block_on(connection::init_db(&app_data_dir))
    .expect("数据库初始化失败");
```

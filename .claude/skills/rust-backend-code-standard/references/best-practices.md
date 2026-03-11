# 最佳实践

## 1. 避免 unwrap

使用 `?` 传播错误，而不是 `unwrap()`：

```rust
// ✅ 正确：使用 ? 传播错误
pub async fn add_record(&self, input: Dto) -> Result<Model, Error> {
    let record = self.validate(input)?;
    let inserted = record.insert(&self.db).await?;
    Ok(inserted)
}

// ✅ 正确：使用 expect 处理初始化阶段错误
let rt = tokio::runtime::Runtime::new()
    .expect("创建 Tokio 运行时失败");

// ❌ 错误：在生产代码中使用 unwrap
let record = Entity::find_by_id(id).one(&db).await.unwrap();
```

### 例外情况

```rust
// 初始化阶段可以使用 expect
let db = rt.block_on(connection::init_db(&app_data_dir))
    .expect("数据库初始化失败");

// 确定不会失败的锁操作
let mut guard = self.child.lock().unwrap();
```

## 2. 使用 Arc 共享所有权

```rust
use std::sync::Arc;

// 数据库连接
let db_arc = Arc::new(db);

// 共享状态
pub struct Manager {
    shared_state: Arc<Mutex<State>>,
}

impl Clone for Manager {
    fn clone(&self) -> Self {
        Self {
            shared_state: self.shared_state.clone(),
        }
    }
}
```

## 3. 实现默认值

为结构体提供合理的默认值：

```rust
impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        Self {
            id: sea_orm::ActiveValue::NotSet,
            // 设置业务默认值
            state: sea_orm::ActiveValue::Set(State::Pending),
            create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
            // 可选字段默认值
            remark: sea_orm::ActiveValue::Set(None),
        }
    }
}
```

## 4. 分页验证

始终验证分页参数：

```rust
pub async fn query_records(
    &self,
    page: i64,
    page_size: i64,
) -> Result<Vec<Model>, String> {
    // 验证页码
    if page < 1 {
        return Err("页码必须大于 0".to_string());
    }

    // 验证每页数量
    if page_size <= 0 {
        return Err("每页数量必须大于 0".to_string());
    }

    // 限制最大每页数量
    const MAX_PAGE_SIZE: i64 = 100;
    let actual_page_size = page_size.min(MAX_PAGE_SIZE);

    // 执行查询
    let offset = (page - 1) * actual_page_size;
    Entity::find()
        .limit(actual_page_size as u64)
        .offset(offset as u64)
        .all(&self.db)
        .await
        .map_err(|e| format!("查询失败: {}", e))
}
```

## 5. 查询构建模式

使用流畅的查询构建链：

```rust
pub async fn build_query(
    &self,
    filters: Filters,
) -> Result<Vec<Model>, Error> {
    let mut query = Entity::find();

    // 条件筛选
    if let Some(status) = filters.status {
        query = query.filter(Column::Status.eq(status));
    }

    if let Some(name) = filters.name {
        if !name.is_empty() {
            query = query.filter(Column::Name.contains(&name));
        }
    }

    // 时间范围
    if let Some(start) = filters.start_time {
        query = query.filter(Column::CreateAt.gte(start));
    }

    if let Some(end) = filters.end_time {
        query = query.filter(Column::CreateAt.lte(end));
    }

    // 排序
    query = query.order_by_desc(Column::CreateAt);

    // 分页
    if let Some(limit) = filters.limit {
        query = query.limit(limit);
    }

    query.all(&self.db).await?;
}
```

## 6. 优雅降级

对于可选组件，允许优雅降级：

```rust
impl SidecarManager {
    pub fn with_default() -> Result<Self> {
        let path = find_executable_path();

        // 不检查是否存在，允许优雅降级
        // 实际使用时会返回错误
        Ok(Self {
            executable_path: path,
            // ...
        })
    }
}

// 使用时处理错误
if let Err(e) = sidecar.start() {
    warn!("Sidecar 启动失败，部分功能可能不可用: {}", e);
    // 继续运行，不中断应用
}
```

## 7. 资源清理

实现 `Drop` trait 自动清理资源：

```rust
impl Drop for SidecarManager {
    fn drop(&mut self) {
        let _ = self.stop();  // 忽略错误，确保清理
    }
}

impl Drop for ConnectionPool {
    fn drop(&mut self) {
        // 释放连接
        self.connections.clear();
    }
}
```

## 8. 类型安全

利用类型系统防止错误：

```rust
// 使用 newtype 模式
#[derive(Debug, Clone)]
pub struct RecordId(i64);

impl RecordId {
    pub fn new(id: i64) -> Result<Self, String> {
        if id > 0 {
            Ok(Self(id))
        } else {
            Err("ID 必须大于 0".to_string())
        }
    }

    pub fn value(&self) -> i64 {
        self.0
    }
}

// 使用枚举限制值范围
#[derive(Debug, Clone)]
pub enum Status {
    Pending,
    Active,
    Completed,
    Cancelled,
}
```

## 9. 错误上下文

添加错误上下文信息：

```rust
pub async fn find_record(&self, id: i64) -> Result<Model, Error> {
    Entity::find_by_id(id)
        .one(&self.db)
        .await?
        .ok_or_else(|| format!("记录不存在: ID={}", id).into())
}

// 或使用 thiserror
#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("记录不存在: ID={id}")]
    RecordNotFound { id: i64 },
}
```

## 10. 日志记录

添加适当的日志：

```rust
use log::{debug, info, warn, error};

pub async fn process(&self, input: Input) -> Result<Output, Error> {
    debug!("开始处理: {:?}", input);

    // 处理逻辑
    let result = self.do_work(input)?;

    info!("处理完成: 结果数量={}", result.len());

    Ok(result)
}

// 错误日志
pub async fn risky_operation(&self) -> Result<(), Error> {
    if let Err(e) = self.try_something().await {
        warn!("操作失败，将重试: {}", e);
        // 重试逻辑
    }
}
```

## 11. 并发安全

```rust
// 使用 Mutex 保护共享状态
use std::sync::Mutex;

pub struct Counter {
    count: Mutex<i32>,
}

impl Counter {
    pub fn increment(&self) -> i32 {
        let mut count = self.count.lock().unwrap();
        *count += 1;
        *count
    }
}

// 异步环境使用 tokio::sync::Mutex
use tokio::sync::Mutex;

pub struct AsyncCache {
    data: Mutex<HashMap<String, String>>,
}
```

## 12. 避免过早优化

```rust
// ✅ 正确：清晰易读
let records: Vec<Info> = models
    .into_iter()
    .filter(|m| m.active)
    .map(Info::from)
    .collect();

// ❌ 避免：过早优化
// 在确认性能瓶颈前，不要过度优化
```

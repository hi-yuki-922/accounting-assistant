# 异步编程

## 异步函数定义

所有涉及 I/O 操作的函数应为 `async` 函数：

```rust
// 服务层方法
pub async fn add_record(&self, input: Dto) -> Result<Model, Error> {
    // ...
}

pub async fn query_attachments(&self, ...) -> Result<Vec<Model>, Error> {
    // ...
}

// 命令层
#[tauri::command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: Dto,
) -> Result<Model, String> {
    service.add_record(input).await.map_err(|e| e.to_string())
}
```

## Tokio Runtime

### 应用初始化时创建

```rust
// lib.rs
pub fn run() {
    let rt = tokio::runtime::Runtime::new().unwrap();

    // 使用 block_on 运行异步代码
    let db = rt.block_on(connection::init_db(&app_data_dir));

    rt.block_on(entity::with_install_entities(conn.as_ref()))?;
}
```

### 在同步上下文中调用异步

```rust
// 使用 block_on
rt.block_on(async {
    service.create_default_book().await
})?;

// 或者使用 spawn_blocking（不阻塞当前线程）
tokio::task::spawn_blocking(|| {
    // 同步代码
}).await?;
```

## 异步操作

### 数据库操作

```rust
// 插入
let inserted = active_model.insert(&self.db).await?;

// 查询
let record = Entity::find_by_id(id).one(&self.db).await?;

// 更新
let updated = active_model.update(&self.db).await?;

// 删除
let deleted = Entity::delete_by_id(id).exec(&self.db).await?;
```

### 文件操作

```rust
pub async fn save_file(path: &Path, content: Vec<u8>) -> Result<(), Error> {
    tokio::fs::write(path, content).await?;
    Ok(())
}

pub async fn read_file(path: &Path) -> Result<Vec<u8>, Error> {
    let content = tokio::fs::read(path).await?;
    Ok(content)
}
```

## 线程安全

### Arc 共享所有权

```rust
// 数据库连接
pub async fn init_db(path: &Path) -> Result<Arc<DatabaseConnection>, Error> {
    let db = Database::connect(&url).await?;
    Ok(Arc::new(db))
}
```

### Mutex 保护共享状态

```rust
pub struct SidecarManager {
    child: Arc<Mutex<Option<Child>>>,
    stdin: Arc<Mutex<Option<ChildStdin>>>,
    pending_requests: Arc<Mutex<HashMap<String, Sender<Response>>>>,
}

impl SidecarManager {
    pub fn start(&self) -> Result<()> {
        // 获取锁
        let mut child_guard = self.child.lock().unwrap();
        *child_guard = Some(child);
        // 锁自动释放
    }
}
```

### 异步锁

对于异步代码中的共享状态，考虑使用 `tokio::sync::Mutex`：

```rust
use tokio::sync::Mutex;

pub struct AsyncManager {
    data: Arc<Mutex<Vec<i32>>>,
}

impl AsyncManager {
    pub async fn add(&self, value: i32) {
        let mut data = self.data.lock().await;
        data.push(value);
    }
}
```

## 并发操作

### 并行执行

```rust
use futures::future::join_all;

async fn fetch_all(ids: Vec<i64>) -> Vec<Model> {
    let futures: Vec<_> = ids.into_iter()
        .map(|id| Entity::find_by_id(id).one(&db))
        .collect();

    let results = join_all(futures).await;
    results.into_iter().filter_map(|r| r.ok()).flatten().collect()
}
```

### 超时处理

```rust
use tokio::time::{timeout, Duration};

async fn with_timeout() -> Result<Response, Error> {
    timeout(Duration::from_secs(5), async_operation())
        .await
        .map_err(|_| "操作超时")?
}
```

## 后台任务

### 生成后台任务

```rust
pub fn start_response_listener(&self, stdout: ChildStdout) {
    let pending_requests = self.pending_requests.clone();

    thread::spawn(move || {
        let reader = BufReader::new(stdout);

        for line in reader.lines() {
            if let Ok(json) = line {
                // 处理响应
            }
        }
    });
}
```

### Tokio 任务

```rust
tokio::spawn(async move {
    // 异步后台任务
    background_work().await;
});
```

## 异步 Trait

使用 `async_trait` 宏：

```rust
use async_trait::async_trait;

#[async_trait]
pub trait Repository {
    async fn find_by_id(&self, id: i64) -> Result<Option<Model>, Error>;
    async fn save(&self, model: Model) -> Result<Model, Error>;
}
```

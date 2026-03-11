# 代码格式化

## 缩进

使用 **2 空格** 缩进：

```rust
pub fn example() {
  if condition {
    do_something();
  }
}

pub struct Service {
  db: DatabaseConnection,
}
```

## 行宽

- 理想行宽：**100 字符**
- 必要时可超出，但避免过长
- 长链式调用可换行

```rust
// 适度的行宽
let result = service.query_attachments(page, page_size, file_name, file_suffix).await?;

// 长链式调用换行
let result = query
    .filter(Column::Name.eq(name))
    .order_by_desc(Column::CreateAt)
    .limit(page_size)
    .all(&self.db)
    .await?;
```

## 大括号

### 开括号不换行

```rust
// ✅ 正确
pub fn example() {
    // ...
}

if condition {
    // ...
}

match value {
    Pattern => action(),
}

// ❌ 错误
pub fn example()
{
    // ...
}
```

### 空结构体

```rust
// ✅ 单行空结构体
pub struct EmptyStruct {}

// 多字段使用块格式
pub struct Service {
    db: DatabaseConnection,
    config: Config,
}
```

### 枚举格式

```rust
// 简单枚举
pub enum Status {
    Active,
    Inactive,
}

// 带数据的枚举
pub enum Message {
    Create { id: i64, name: String },
    Update { id: i64 },
    Delete(i64),
}
```

## 尾随逗号

多行结构体、枚举、数组等使用尾随逗号：

```rust
// ✅ 正确：多行使用尾随逗号
let new_record = ActiveModel {
    id: sea_orm::ActiveValue::Set(id),
    amount: sea_orm::ActiveValue::Set(amount),
    record_time: sea_orm::ActiveValue::Set(record_time),
};

let fields = vec![
    "id",
    "name",
    "amount",
];

// 单行不需要尾随逗号
let point = Point { x: 1, y: 2 };
let nums = vec![1, 2, 3];
```

## 空行规则

### 模块级别

```rust
use crate::entity::record;
use crate::services::Service;

const DEFAULT_VALUE: i64 = 0;

pub struct Handler {
    // ...
}

impl Handler {
    // ...
}
```

### 函数级别

```rust
pub async fn process(&self, input: Input) -> Result<Output, Error> {
    // 参数验证
    if input.id <= 0 {
        return Err("无效 ID".into());
    }

    // 查询数据
    let record = self.find_record(input.id).await?;

    // 处理逻辑
    let result = self.transform(record)?;

    Ok(result)
}
```

## 函数参数

长参数列表换行对齐：

```rust
// 单行适合
pub async fn get_record(&self, id: i64) -> Result<Model, Error> { }

// 长参数换行
pub async fn query_attachments(
    &self,
    page: i64,
    page_size: i64,
    file_name: Option<String>,
    file_suffix: Option<String>,
    start_time: Option<DateTime<Utc>>,
    end_time: Option<DateTime<Utc>>,
    master_id: Option<i64>,
) -> Result<Vec<Model>, Error> {
    // ...
}
```

## 链式调用

```rust
// 短链单行
let result = query.filter(id.eq(1)).one(&self.db).await?;

// 长链换行，点号在前
let result = Entity::find()
    .filter(Column::Status.eq(Status::Active))
    .filter(Column::Amount.gt(0))
    .order_by_desc(Column::CreateAt)
    .limit(10)
    .all(&self.db)
    .await?;
```

## 格式化工具

使用 `cargo fmt` 自动格式化：

```bash
cargo fmt
```

项目可配置 `rustfmt.toml` 自定义规则。

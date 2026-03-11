# 数据库操作

## 连接池管理

### 初始化

```rust
// db/connection.rs
use sea_orm::{Database, DatabaseConnection};
use std::sync::Arc;
use std::path::Path;

/// 初始化 SQLite 数据库连接
pub async fn init_db(app_data_dir: &Path) -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    let db_path = app_data_dir.join("core.sqlite");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_str().ok_or("无效数据库路径")?);

    let db = Database::connect(&db_url).await?;
    let db_arc = Arc::new(db);

    Ok(db_arc)
}
```

### 数据库配置

- 使用 SQLite (`sqlite:`)
- 使用 `mode=rwc` 读写创建模式
- 数据库文件名：`core.sqlite`
- 存储位置：应用数据目录

## 查询构建

### 基本查询

```rust
// 查询单条
let record = Entity::find_by_id(id)
    .one(&self.db)
    .await?;

// 查询全部
let records = Entity::find()
    .all(&self.db)
    .await?;
```

### 条件筛选

```rust
let mut query = Entity::find();

// 等于
query = query.filter(Column::Status.eq(Status::Active));

// 包含（模糊匹配）
if let Some(name) = file_name {
    if !name.is_empty() {
        query = query.filter(Column::Name.contains(&name));
    }
}

// 范围查询
if let Some(start) = start_time {
    query = query.filter(Column::CreateAt.gte(start));
}

// 组合条件
query = query
    .filter(Column::Status.eq(Status::Active))
    .filter(Column::Amount.gt(0));
```

### 排序

```rust
// 降序
query = query.order_by_desc(Column::CreateAt);

// 升序
query = query.order_by_asc(Column::Name);

// 多字段排序
query = query
    .order_by_desc(Column::CreateAt)
    .order_by_asc(Column::Id);
```

### 分页

```rust
// 验证参数
if page < 1 {
    return Err("页码必须大于 0".to_string());
}
if page_size <= 0 {
    return Err("每页数量必须大于 0".to_string());
}

// 计算偏移
let offset = (page - 1) * page_size;

query = query
    .limit(page_size as u64)
    .offset(offset as u64);
```

## 插入操作

### 使用 ActiveModel

```rust
// 创建 ActiveModel
let new_record = ActiveModel {
    id: sea_orm::ActiveValue::Set(id),
    amount: sea_orm::ActiveValue::Set(amount),
    record_time: sea_orm::ActiveValue::Set(record_time),
    title: sea_orm::ActiveValue::Set(title),
    // ...
    create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
};

// 插入
let inserted = new_record.insert(&self.db).await?;
```

## 更新操作

### 部分更新

```rust
// 获取现有记录
let record = Entity::find_by_id(id)
    .one(&self.db)
    .await?
    .ok_or("记录不存在")?;

// 转换为 ActiveModel
let mut active_model: ActiveModel = record.into();

// 只更新指定字段
if let Some(new_amount) = amount {
    active_model.amount = sea_orm::ActiveValue::Set(new_amount);
}

if let Some(new_title) = title {
    active_model.title = sea_orm::ActiveValue::Set(new_title);
}

// 执行更新
let updated = active_model.update(&self.db).await?;
```

## 删除操作

```rust
// 按 ID 删除
Entity::delete_by_id(id)
    .exec(&self.db)
    .await?;

// 条件删除
Entity::delete_many()
    .filter(Column::Status.eq(Status::Deleted))
    .exec(&self.db)
    .await?;
```

## 事务处理

```rust
use sea_orm::TransactionTrait;

pub async fn transfer(&self, from_id: i64, to_id: i64, amount: Decimal) -> Result<(), Error> {
    // 开启事务
    let txn = self.db.begin().await?;

    // 执行操作
    let from = Entity::find_by_id(from_id).one(&txn).await?
        .ok_or("源账户不存在")?;

    let to = Entity::find_by_id(to_id).one(&txn).await?
        .ok_or("目标账户不存在")?;

    // 更新操作...
    let mut from_active: ActiveModel = from.into();
    from_active.amount = sea_orm::ActiveValue::Set(from_active.amount.unwrap() - amount);
    from_active.update(&txn).await?;

    // 提交事务
    txn.commit().await?;

    Ok(())
}
```

## 关联查询

```rust
// 定义关联
#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    AccountingBook,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::AccountingBook => Entity::belongs_to(super::accounting_book::Entity)
                .from(Column::BookId)
                .to(super::accounting_book::Column::Id)
                .into(),
        }
    }
}

// 查询关联
let records = Entity::find()
    .find_also_related(super::accounting_book::Entity)
    .all(&self.db)
    .await?;
```

## 完整示例

```rust
pub async fn query_attachments(
    &self,
    page: i64,
    page_size: i64,
    file_name: Option<String>,
    start_time: Option<DateTime<Utc>>,
) -> Result<Vec<Model>, String> {
    // 参数验证
    if page < 1 {
        return Err("页码必须大于 0".to_string());
    }

    // 构建查询
    let mut query = Entity::find();

    // 筛选条件
    if let Some(name) = file_name {
        if !name.is_empty() {
            query = query.filter(Column::FileName.contains(&name));
        }
    }

    if let Some(start) = start_time {
        query = query.filter(Column::CreateAt.gte(start.naive_utc()));
    }

    // 排序和分页
    query = query
        .order_by_desc(Column::CreateAt)
        .limit(page_size as u64)
        .offset(((page - 1) * page_size) as u64);

    // 执行查询
    query.all(&self.db).await.map_err(|e| format!("查询失败: {}", e))
}
```

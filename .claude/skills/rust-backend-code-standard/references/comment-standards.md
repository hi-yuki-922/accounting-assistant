# 注释规范

## 文档注释

使用 `///` 添加文档注释，生成 API 文档：

```rust
/// 记账服务
///
/// 提供记账记录的增删改查功能
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

/// 添加记账记录
///
/// # 参数
/// - `input`: 记账数据传输对象
///
/// # 返回
/// 成功返回创建的记录模型，失败返回错误
///
/// # 示例
/// ```ignore
/// let record = service.add_record(dto).await?;
/// ```
pub async fn add_record(
    &self,
    input: AddAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    // ...
}
```

## 行内注释

使用中文行内注释说明复杂逻辑：

```rust
pub async fn create_attachment(&self, ...) -> Result<(i64, String), String> {
    // 验证参数
    if master_id <= 0 {
        return Err("主表记录 ID 必须大于 0".to_string());
    }

    // 保存物理文件
    let storage_path = AttachmentStorage::save_file(app_handle, &file_name, file_content).await?;

    // 获取存储路径字符串
    let path_str = storage_path
        .to_str()
        .ok_or("存储路径转换为字符串失败")?
        .to_string();

    // 创建数据库记录
    let attachment_model = attachment::ActiveModel {
        // ...
    };

    // ...
}
```

## 模块注释

使用 `//!` 添加模块级文档注释：

```rust
//! 服务模块
//!
//! 提供各业务领域的服务实现，通过 Tauri `app.manage()` 进行依赖注入。
//! 具体的实例管理和生命周期由 Tauri 的 State 机制处理。

pub mod accounting;
pub mod attachment;
pub mod accounting_book;
```

## 函数注释模板

```rust
/// [简短描述]
///
/// [详细描述（可选）]
///
/// # 参数
/// - `param1`: 参数说明
/// - `param2`: 参数说明
///
/// # 返回
/// 返回值说明
///
/// # 错误
/// 可能的错误情况说明
///
/// # 示例
/// ```ignore
/// // 使用示例
/// ```
pub async fn function_name(&self, param1: Type1, param2: Type2) -> Result<ReturnType, Error> {
    // ...
}
```

## 结构体注释

```rust
/// 记账记录实体
///
/// 存储单笔记账记录的所有信息
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record")]
pub struct Model {
    /// 唯一标识符，格式为 YYYYMMDDNNNNN
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    /// 金额，精确到 4 位小数
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub amount: Decimal,

    /// 记账时间
    pub record_time: NaiveDateTime,

    /// 记账类型（收入/支出/投资收益/投资亏损）
    pub accounting_type: AccountingType,

    /// 备注信息（可选）
    pub remark: Option<String>,
}
```

## 枚举注释

```rust
/// 记账类型枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingType {
    /// 收入
    Income,
    /// 支出
    Expenditure,
    /// 投资收益
    InvestmentIncome,
    /// 投资亏损
    InvestmentLoss,
}
```

## 注释原则

### 注释什么

1. **公共 API**：所有 public 函数、结构体、枚举
2. **复杂逻辑**：难以理解的业务规则
3. **边界条件**：特殊情况的处理
4. **非显而易见的设计决策**：为什么这样做

### 不注释什么

1. **显而易见的代码**：`i += 1` 不需要注释
2. **重复代码含义的注释**：`// 获取 ID` 而 `get_id()`
3. **过时的注释**：代码修改后更新注释

### 注释风格

```rust
// ✅ 好的注释：解释原因和目的
// 使用 Decimal 而非 f64 避免浮点精度问题
pub amount: Decimal,

// ✅ 好的注释：说明复杂业务规则
// 只有待入账状态的记录可以修改，已入账记录不可更改
if record.state != AccountingRecordState::PendingPosting {
    return Err("只有待入账状态的记录可以修改".into());
}

// ❌ 不好的注释：重复代码含义
// 设置金额
active_model.amount = ActiveValue::Set(amount);

// ❌ 不好的注释：过时信息
// TODO: 优化性能（但已完成）
```

## TODO 和 FIXME

```rust
// TODO: 未来需要实现的功能
// TODO(username): 具体描述，可以指定负责人

// FIXME: 需要修复的问题
// FIXME: 这里在高并发下可能有问题

// HACK: 临时解决方案
// HACK: 临时使用这种方式绕过问题，后续需要重构

// NOTE: 重要提示
// NOTE: 这里不要修改，影响核心逻辑
```

## 文档生成

使用 `cargo doc` 生成文档：

```bash
# 生成文档
cargo doc

# 生成并打开文档
cargo doc --open

# 包含私有项
cargo doc --document-private-items
```

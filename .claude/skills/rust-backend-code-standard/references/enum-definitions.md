# 枚举定义

## 枚举派生

使用 `strum` 和 `serde` 派生必要的 trait：

```rust
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingType {
    Income,
    Expenditure,
    InvestmentIncome,
    InvestmentLoss,
}
```

## 字符串解析

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

## 字符串转换

提供 `as_str()` 方法转换回中文：

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

## Sea-ORM 集成

### TryGetable 实现

```rust
use sea_orm::{DbErr, TryGetable, Value};
use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};

impl TryGetable for AccountingType {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(
                DbErr::Type(String::from("无效的记账类型"))
            ))
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(
                DbErr::Type(String::from("无效的记账类型"))
            ))
    }
}
```

### ValueType 实现

```rust
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
```

### From 枚举转 Value

```rust
impl From<AccountingType> for Value {
    fn from(e: AccountingType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}
```

### TryFromU64 实现

```rust
impl sea_orm::TryFromU64 for AccountingType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("无法从 u64 转换为记账类型")))
    }
}
```

## 完整枚举示例

```rust
// enums/accounting.rs
use serde::{Deserialize, Serialize};
use sea_orm::{DbErr, TryGetable, Value};
use sea_orm::sea_query::{ColumnType, StringLen};
use strum::{Display, EnumIter};

/// 记账类型
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingType {
    Income,
    Expenditure,
    InvestmentIncome,
    InvestmentLoss,
}

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

impl TryGetable for AccountingType {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账类型"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账类型"))))
    }
}

impl sea_orm::sea_query::ValueType for AccountingType {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s.parse::<AccountingType>().map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String { stringify!(AccountingType).to_owned() }
    fn array_type() -> sea_orm::sea_query::ArrayType { sea_orm::sea_query::ArrayType::String }
    fn column_type() -> ColumnType { ColumnType::String(StringLen::None) }
}

impl From<AccountingType> for Value {
    fn from(e: AccountingType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for AccountingType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("无法从 u64 转换")))
    }
}

/// 支付渠道
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingChannel {
    Cash,
    AliPay,
    Wechat,
    BankCard,
    Unknown,
}

// ... 类似的 trait 实现

/// 记账状态
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingRecordState {
    PendingPosting,  // 待入账
    Posted,          // 已入账
}

// ... 类似的 trait 实现
```

## 枚举模块组织

```rust
// enums/mod.rs
pub mod accounting;
pub use accounting::*;
```

## 使用示例

```rust
// 解析字符串
let account_type: AccountingType = "收入".parse().unwrap();

// 转换为字符串
let type_str = account_type.as_str();  // "收入"

// 序列化
let json = serde_json::to_string(&account_type)?;  // "Income"

// 数据库存储
// 存储为中文: "收入"
// 读取时自动解析
```

use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use sea_orm::{DbErr, TryGetable, Value};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

/// 订单类型枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum OrderType {
    /// 销售订单
    Sales,
    /// 采购订单
    Purchase,
}

impl std::str::FromStr for OrderType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Sales" => Ok(OrderType::Sales),
            "Purchase" => Ok(OrderType::Purchase),
            _ => Err(()),
        }
    }
}

impl OrderType {
    fn as_str(&self) -> &'static str {
        match self {
            OrderType::Sales => "Sales",
            OrderType::Purchase => "Purchase",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for OrderType {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单类型")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单类型")))
        })
    }
}

impl sea_orm::sea_query::ValueType for OrderType {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<OrderType>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(OrderType).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<OrderType> for Value {
    fn from(e: OrderType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for OrderType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("无法将 u64 转换为 OrderType")))
    }
}

/// 订单状态枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum OrderStatus {
    /// 待结账
    Pending,
    /// 已结账
    Settled,
    /// 已取消
    Cancelled,
}

impl std::str::FromStr for OrderStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Pending" => Ok(OrderStatus::Pending),
            "Settled" => Ok(OrderStatus::Settled),
            "Cancelled" => Ok(OrderStatus::Cancelled),
            _ => Err(()),
        }
    }
}

impl OrderStatus {
    fn as_str(&self) -> &'static str {
        match self {
            OrderStatus::Pending => "Pending",
            OrderStatus::Settled => "Settled",
            OrderStatus::Cancelled => "Cancelled",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for OrderStatus {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderStatus>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单状态")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderStatus>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单状态")))
        })
    }
}

impl sea_orm::sea_query::ValueType for OrderStatus {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<OrderStatus>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(OrderStatus).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<OrderStatus> for Value {
    fn from(e: OrderStatus) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for OrderStatus {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 OrderStatus",
        )))
    }
}

use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use sea_orm::{DbErr, TryGetable, Value};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

/// 订单业务类型枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum OrderSubType {
    /// 批发（销售）
    Wholesale,
    /// 零售（销售）
    Retail,
    /// 批发进货（采购）
    WholesalePurchase,
    /// 同行调货（采购）
    PeerTransfer,
}

impl std::str::FromStr for OrderSubType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Wholesale" => Ok(OrderSubType::Wholesale),
            "Retail" => Ok(OrderSubType::Retail),
            "WholesalePurchase" => Ok(OrderSubType::WholesalePurchase),
            "PeerTransfer" => Ok(OrderSubType::PeerTransfer),
            _ => Err(()),
        }
    }
}

impl OrderSubType {
    pub fn as_str(&self) -> &'static str {
        match self {
            OrderSubType::Wholesale => "Wholesale",
            OrderSubType::Retail => "Retail",
            OrderSubType::WholesalePurchase => "WholesalePurchase",
            OrderSubType::PeerTransfer => "PeerTransfer",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for OrderSubType {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderSubType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单业务类型")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<OrderSubType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的订单业务类型")))
        })
    }
}

impl sea_orm::sea_query::ValueType for OrderSubType {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<OrderSubType>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(OrderSubType).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<OrderSubType> for Value {
    fn from(e: OrderSubType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for OrderSubType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 OrderSubType",
        )))
    }
}

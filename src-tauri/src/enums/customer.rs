use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use sea_orm::{DbErr, TryGetable, Value};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

/// 客户分类枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum CustomerCategory {
    /// 零售商
    Retailer,
    /// 供应商
    Supplier,
}

impl std::str::FromStr for CustomerCategory {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Retailer" => Ok(CustomerCategory::Retailer),
            "Supplier" => Ok(CustomerCategory::Supplier),
            _ => Err(()),
        }
    }
}

impl CustomerCategory {
    fn as_str(&self) -> &'static str {
        match self {
            CustomerCategory::Retailer => "Retailer",
            CustomerCategory::Supplier => "Supplier",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for CustomerCategory {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<CustomerCategory>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的客户分类")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<CustomerCategory>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的客户分类")))
        })
    }
}

impl sea_orm::sea_query::ValueType for CustomerCategory {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<CustomerCategory>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(CustomerCategory).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<CustomerCategory> for Value {
    fn from(e: CustomerCategory) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for CustomerCategory {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 CustomerCategory",
        )))
    }
}

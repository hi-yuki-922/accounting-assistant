use serde::{Deserialize, Serialize};
use sea_orm::{TryGetable, DbErr, Value};
use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use strum::{Display, EnumIter};

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingChannel {
    Cash,
    AliPay,
    Wechat,
    BankCard,
    Unknown,
}

impl std::str::FromStr for AccountingChannel {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "现金" => Ok(AccountingChannel::Cash),
            "支付宝" => Ok(AccountingChannel::AliPay),
            "微信" => Ok(AccountingChannel::Wechat),
            "银行卡" => Ok(AccountingChannel::BankCard),
            "未知" => Ok(AccountingChannel::Unknown),
            _ => Err(()),
        }
    }
}

impl AccountingChannel {
    fn as_str(&self) -> &'static str {
        match self {
            AccountingChannel::Cash => "现金",
            AccountingChannel::AliPay => "支付宝",
            AccountingChannel::Wechat => "微信",
            AccountingChannel::BankCard => "银行卡",
            AccountingChannel::Unknown => "未知",
        }
    }
}

// Implement SeaORM conversion traits for AccountingType
impl TryGetable for AccountingType {
    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }

    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }
}

impl sea_orm::sea_query::ValueType for AccountingType {
    fn type_name() -> String {
        stringify!(AccountingType).to_owned()
    }

    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<AccountingType>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<AccountingType> for Value {
    fn from(e: AccountingType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for AccountingType {
    fn try_from_u64(_n: u64) -> Result<Self, sea_orm::DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingType")))
    }
}

// Implement SeaORM conversion traits for AccountingChannel
impl TryGetable for AccountingChannel {
    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingChannel>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingChannel"))))
    }

    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingChannel>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingChannel"))))
    }
}

impl sea_orm::sea_query::ValueType for AccountingChannel {
    fn type_name() -> String {
        stringify!(AccountingChannel).to_owned()
    }

    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<AccountingChannel>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<AccountingChannel> for Value {
    fn from(e: AccountingChannel) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for AccountingChannel {
    fn try_from_u64(_n: u64) -> Result<Self, sea_orm::DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingChannel")))
    }
}
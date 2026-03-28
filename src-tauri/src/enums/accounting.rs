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
            "Income" => Ok(AccountingType::Income),
            "Expenditure" => Ok(AccountingType::Expenditure),
            "InvestmentIncome" => Ok(AccountingType::InvestmentIncome),
            "InvestmentLoss" => Ok(AccountingType::InvestmentLoss),
            _ => Err(()),
        }
    }
}

impl AccountingType {
    fn as_str(&self) -> &'static str {
        match self {
            AccountingType::Income => "Income",
            AccountingType::Expenditure => "Expenditure",
            AccountingType::InvestmentIncome => "InvestmentIncome",
            AccountingType::InvestmentLoss => "InvestmentLoss",
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
            "Cash" => Ok(AccountingChannel::Cash),
            "AliPay" => Ok(AccountingChannel::AliPay),
            "Wechat" => Ok(AccountingChannel::Wechat),
            "BankCard" => Ok(AccountingChannel::BankCard),
            "Unknown" => Ok(AccountingChannel::Unknown),
            _ => Err(()),
        }
    }
}

impl AccountingChannel {
    fn as_str(&self) -> &'static str {
        match self {
            AccountingChannel::Cash => "Cash",
            AccountingChannel::AliPay => "AliPay",
            AccountingChannel::Wechat => "Wechat",
            AccountingChannel::BankCard => "BankCard",
            AccountingChannel::Unknown => "Unknown",
        }
    }
}

// Implement SeaORM conversion traits for AccountingType
impl TryGetable for AccountingType {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingType"))))
    }
}

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

impl From<AccountingType> for Value {
    fn from(e: AccountingType) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for AccountingType {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingType")))
    }
}

// Implement SeaORM conversion traits for AccountingChannel
impl TryGetable for AccountingChannel {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingChannel>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingChannel"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingChannel>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingChannel"))))
    }
}

impl sea_orm::sea_query::ValueType for AccountingChannel {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<AccountingChannel>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(AccountingChannel).to_owned()
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
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingChannel")))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingRecordState {
    PendingPosting,
    Posted,
}

impl std::str::FromStr for AccountingRecordState {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "PendingPosting" => Ok(AccountingRecordState::PendingPosting),
            "Posted" => Ok(AccountingRecordState::Posted),
            _ => Err(()),
        }
    }
}

impl AccountingRecordState {
    fn as_str(&self) -> &'static str {
        match self {
            AccountingRecordState::PendingPosting => "PendingPosting",
            AccountingRecordState::Posted => "Posted",
        }
    }
}

// Implement SeaORM conversion traits for AccountingRecordState
impl TryGetable for AccountingRecordState {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingRecordState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingRecordState"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingRecordState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid AccountingRecordState"))))
    }
}

impl sea_orm::sea_query::ValueType for AccountingRecordState {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<AccountingRecordState>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(AccountingRecordState).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<AccountingRecordState> for Value {
    fn from(e: AccountingRecordState) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for AccountingRecordState {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("Cannot convert u64 to AccountingRecordState")))
    }
}

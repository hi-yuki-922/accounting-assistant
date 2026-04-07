use sea_orm::sea_query::Nullable;
use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use sea_orm::{DbErr, TryGetable, Value};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

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
    /// 冲账类型
    WriteOff,
}

impl std::str::FromStr for AccountingType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Income" => Ok(AccountingType::Income),
            "Expenditure" => Ok(AccountingType::Expenditure),
            "InvestmentIncome" => Ok(AccountingType::InvestmentIncome),
            "InvestmentLoss" => Ok(AccountingType::InvestmentLoss),
            "WriteOff" => Ok(AccountingType::WriteOff),
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
            AccountingType::WriteOff => "WriteOff",
        }
    }
}

/// 记账渠道枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingChannel {
    /// 现金
    Cash,
    /// 支付宝
    AliPay,
    /// 微信
    Wechat,
    /// 银行卡
    BankCard,
    /// 未知
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

// SeaORM 转换 trait 实现
impl TryGetable for AccountingType {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账类型")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingType>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账类型")))
        })
    }
}

impl sea_orm::sea_query::ValueType for AccountingType {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<AccountingType>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
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
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 AccountingType",
        )))
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for AccountingChannel {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx)?;
        value.parse::<AccountingChannel>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账渠道")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col)?;
        value.parse::<AccountingChannel>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账渠道")))
        })
    }
}

impl sea_orm::sea_query::ValueType for AccountingChannel {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<AccountingChannel>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
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
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 AccountingChannel",
        )))
    }
}

impl Nullable for AccountingChannel {
    fn null() -> Value {
        Value::String(None)
    }
}

/// 记账记录状态枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum AccountingRecordState {
    /// 待入账
    PendingPosting,
    /// 已入账
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

// SeaORM 转换 trait 实现
impl TryGetable for AccountingRecordState {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingRecordState>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账记录状态")))
        })
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<AccountingRecordState>().map_err(|_| {
            sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的记账记录状态")))
        })
    }
}

impl sea_orm::sea_query::ValueType for AccountingRecordState {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<AccountingRecordState>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
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
        Err(DbErr::Type(String::from(
            "无法将 u64 转换为 AccountingRecordState",
        )))
    }
}

use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};
use sea_orm::{DbErr, TryGetable, Value};
use serde::{Deserialize, Serialize};
use strum::{Display, EnumIter};

/// 消息角色枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum MessageRole {
    User,
    Assistant,
    System,
}

impl std::str::FromStr for MessageRole {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "user" => Ok(MessageRole::User),
            "assistant" => Ok(MessageRole::Assistant),
            "system" => Ok(MessageRole::System),
            _ => Err(()),
        }
    }
}

impl MessageRole {
    fn as_str(&self) -> &'static str {
        match self {
            MessageRole::User => "user",
            MessageRole::Assistant => "assistant",
            MessageRole::System => "system",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for MessageRole {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value
            .parse::<MessageRole>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的消息角色"))))
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value
            .parse::<MessageRole>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的消息角色"))))
    }
}

impl sea_orm::sea_query::ValueType for MessageRole {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<MessageRole>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(MessageRole).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<MessageRole> for Value {
    fn from(e: MessageRole) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for MessageRole {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("无法将 u64 转换为 MessageRole")))
    }
}

/// 消息状态枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumIter)]
pub enum MessageState {
    Sending,
    Sent,
    Completed,
    Failed,
}

impl std::str::FromStr for MessageState {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "sending" => Ok(MessageState::Sending),
            "sent" => Ok(MessageState::Sent),
            "completed" => Ok(MessageState::Completed),
            "failed" => Ok(MessageState::Failed),
            _ => Err(()),
        }
    }
}

impl MessageState {
    fn as_str(&self) -> &'static str {
        match self {
            MessageState::Sending => "sending",
            MessageState::Sent => "sent",
            MessageState::Completed => "completed",
            MessageState::Failed => "failed",
        }
    }
}

// SeaORM 转换 trait 实现
impl TryGetable for MessageState {
    fn try_get_by<I: sea_orm::ColIdx>(
        res: &sea_orm::QueryResult,
        idx: I,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value
            .parse::<MessageState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的消息状态"))))
    }

    fn try_get(
        res: &sea_orm::QueryResult,
        pre: &str,
        col: &str,
    ) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value
            .parse::<MessageState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("无效的消息状态"))))
    }
}

impl sea_orm::sea_query::ValueType for MessageState {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => s
                .parse::<MessageState>()
                .map_err(|_| sea_orm::sea_query::ValueTypeErr),
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        stringify!(MessageState).to_owned()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::String
    }

    fn column_type() -> SeaQueryColumnType {
        SeaQueryColumnType::String(StringLen::None)
    }
}

impl From<MessageState> for Value {
    fn from(e: MessageState) -> Value {
        Value::String(Some(e.as_str().to_string()))
    }
}

impl sea_orm::TryFromU64 for MessageState {
    fn try_from_u64(_n: u64) -> Result<Self, DbErr> {
        Err(DbErr::Type(String::from("无法将 u64 转换为 MessageState")))
    }
}

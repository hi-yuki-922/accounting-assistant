use chrono::{NaiveDateTime};
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use sea_orm::{TryGetable, DbErr, Value};
use sea_orm::sea_query::{ColumnType as SeaQueryColumnType, StringLen};

/// 消息角色枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    User,
    Assistant,
    System,
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

impl TryGetable for MessageRole {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<MessageRole>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid MessageRole"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<MessageRole>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid MessageRole"))))
    }
}

impl sea_orm::sea_query::ValueType for MessageRole {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<MessageRole>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
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
        Err(DbErr::Type(String::from("Cannot convert u64 to MessageRole")))
    }
}

/// 消息状态枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageState {
    Sending,
    Sent,
    Completed,
    Failed,
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

impl TryGetable for MessageState {
    fn try_get_by<I: sea_orm::ColIdx>(res: &sea_orm::QueryResult, idx: I) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get_by(idx).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<MessageState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid MessageState"))))
    }

    fn try_get(res: &sea_orm::QueryResult, pre: &str, col: &str) -> Result<Self, sea_orm::TryGetError> {
        let value: String = res.try_get(pre, col).map_err(sea_orm::TryGetError::DbErr)?;
        value.parse::<MessageState>()
            .map_err(|_| sea_orm::TryGetError::DbErr(DbErr::Type(String::from("Invalid MessageState"))))
    }
}

impl sea_orm::sea_query::ValueType for MessageState {
    fn try_from(v: Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        match v {
            Value::String(Some(s)) => {
                s.parse::<MessageState>()
                    .map_err(|_| sea_orm::sea_query::ValueTypeErr)
            },
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
        Err(DbErr::Type(String::from("Cannot convert u64 to MessageState")))
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "chat_message")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    pub session_id: i64,
    pub role: MessageRole,
    pub content: String,
    pub tokens: Option<i32>,
    pub created_at: NaiveDateTime,
    pub state: MessageState,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        unimplemented!()
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            session_id: sea_orm::ActiveValue::NotSet,
            role: sea_orm::ActiveValue::NotSet,
            content: sea_orm::ActiveValue::NotSet,
            tokens: sea_orm::ActiveValue::NotSet,
            created_at: sea_orm::ActiveValue::Set(now),
            state: sea_orm::ActiveValue::Set(MessageState::Sending),
        }
    }
}

impl Model {
    /// 生成唯一的消息 ID，格式为 YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        // 获取今天的下一个序列号
        let next_seq = super::chat_message_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

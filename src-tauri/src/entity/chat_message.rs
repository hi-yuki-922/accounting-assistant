use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use crate::enums::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
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

use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "chat_session")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    pub title: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,

    /// LLM 生成的会话摘要
    #[sea_orm(nullable)]
    pub summary: Option<String>,
    /// 标题是否为自动生成（true 时 LLM 摘要生成可覆盖标题）
    #[sea_orm(default_value = true)]
    pub title_auto_generated: bool,
    /// 是否已生成过摘要（true 时不再自动生成）
    #[sea_orm(default_value = false)]
    pub summary_generated: bool,
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
            title: sea_orm::ActiveValue::NotSet,
            created_at: sea_orm::ActiveValue::Set(now),
            updated_at: sea_orm::ActiveValue::Set(now),
            summary: sea_orm::ActiveValue::NotSet,
            title_auto_generated: sea_orm::ActiveValue::Set(true),
            summary_generated: sea_orm::ActiveValue::Set(false),
        }
    }
}

impl Model {
    /// 生成唯一的会话 ID，格式为 YYYYMMDDNNNNN
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

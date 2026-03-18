use chrono::{NaiveDateTime};
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;

/// 聊天消息和会话的 ID 序列号管理表
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "chat_message_seq")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    /// 日期键，格式为 YYYYMMDD
    pub date_key: i32,

    /// 当天的序列号
    pub seq: i32,

    /// 创建时间
    pub created_at: NaiveDateTime,
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
            date_key: sea_orm::ActiveValue::NotSet,
            seq: sea_orm::ActiveValue::NotSet,
            created_at: sea_orm::ActiveValue::Set(now),
        }
    }
}

impl Model {
    /// 获取指定日期的下一个序列号
    /// 如果该日期的序列号记录不存在，则创建并返回 1
    pub async fn get_next_sequence(
        db: &DatabaseConnection,
        date_key: i32,
    ) -> Result<i32, Box<dyn std::error::Error>> {
        use sea_orm::{EntityTrait, ActiveModelTrait, Set};

        // 尝试查找现有的序列号记录
        let existing_seq = Entity::find()
            .filter(Column::DateKey.eq(date_key))
            .one(db)
            .await?;

        if let Some(record) = existing_seq {
            // 更新现有记录的序列号
            let next_seq = record.seq + 1;
            let mut active_model: ActiveModel = record.into();
            active_model.seq = Set(next_seq);
            active_model.update(db).await?;
            Ok(next_seq)
        } else {
            // 创建新的序列号记录，序列号从 1 开始
            let new_seq = Model::generate_id(db)?;
            let mut active_model: ActiveModel = ActiveModel {
                id: Set(new_seq),
                date_key: Set(date_key),
                seq: Set(1),
                created_at: Set(chrono::Local::now().naive_local()),
            };
            active_model.insert(db).await?;
            Ok(1)
        }
    }

    /// 生成序列号记录的 ID
    fn generate_id(_db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d%H%M%S").to_string();
        Ok(date_str.parse::<i64>().unwrap())
    }
}

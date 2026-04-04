use chrono::{Datelike, NaiveDateTime};
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "accounting_book")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    pub title: String,
    pub description: Option<String>,
    pub create_at: NaiveDateTime,
    /// 记录数量（缓存字段，用于优化查询性能）
    pub record_count: i32,
    /// 账本图标
    pub icon: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        panic!("No relations defined")
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            title: sea_orm::ActiveValue::NotSet,
            description: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
            record_count: sea_orm::ActiveValue::Set(0),
            icon: sea_orm::ActiveValue::NotSet,
        }
    }
}

impl Model {
    /// 生成账本 ID，格式为 yyyyxxxx（4位年份+4位流水号）
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let year = now.year();

        // 获取今年的下一个流水号
        let next_seq = super::accounting_book_seq::Model::get_next_sequence(db, year).await?;

        // 组合生成 ID：yyyyxxxx
        let id = (year as i64) * 10000 + next_seq as i64;
        Ok(id)
    }
}

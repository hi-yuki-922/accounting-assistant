use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use crate::enums::CustomerCategory;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "customer")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,
    pub name: String,
    pub category: CustomerCategory,
    pub phone: String,
    pub wechat: Option<String>,
    pub address: Option<String>,
    pub bank_account: Option<String>,
    pub remark: Option<String>,
    pub create_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            name: sea_orm::ActiveValue::NotSet,
            category: sea_orm::ActiveValue::NotSet,
            phone: sea_orm::ActiveValue::NotSet,
            wechat: sea_orm::ActiveValue::NotSet,
            address: sea_orm::ActiveValue::NotSet,
            bank_account: sea_orm::ActiveValue::NotSet,
            remark: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
        }
    }
}

impl Model {
    /// 生成唯一客户 ID，格式：YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        let next_seq = super::customer_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

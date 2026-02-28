use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "attachment")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,

    pub master_id: i64,
    pub path: String,
    pub file_name: String,
    pub file_suffix: String,
    pub file_size: String,
    pub create_at: NaiveDateTime,
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
            master_id: sea_orm::ActiveValue::NotSet,
            path: sea_orm::ActiveValue::NotSet,
            file_name: sea_orm::ActiveValue::NotSet,
            file_suffix: sea_orm::ActiveValue::NotSet,
            file_size: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
        }
    }
}

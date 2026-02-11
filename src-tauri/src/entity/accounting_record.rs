use chrono::{NaiveDateTime};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,

    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub amount: Decimal,

    pub record_time: NaiveDateTime,
    pub accounting_type: AccountingType,
    pub title: String,
    pub channel: AccountingChannel,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub create_at: NaiveDateTime,
    pub state: AccountingRecordState,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        panic!("No relations defined") // Since there are no relations defined for this entity
    }
}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            amount: sea_orm::ActiveValue::NotSet,
            record_time: sea_orm::ActiveValue::NotSet,
            accounting_type: sea_orm::ActiveValue::NotSet,
            title: sea_orm::ActiveValue::NotSet,
            channel: sea_orm::ActiveValue::NotSet,
            remark: sea_orm::ActiveValue::NotSet,
            write_off_id: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
            state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
        }
    }
}

impl Model {
    // Generate a unique ID in the format YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        // Get the next sequence number for today
        let next_seq = super::accounting_record_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

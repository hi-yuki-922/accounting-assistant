use crate::enums::{AccountingChannel, AccountingRecordState, AccountingType};
use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
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
    pub book_id: Option<i64>,
    /// 关联订单 ID
    pub order_id: Option<i64>,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    AccountingBook,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::AccountingBook => Entity::belongs_to(super::accounting_book::Entity)
                .from(Column::BookId)
                .to(super::accounting_book::Column::Id)
                .into(),
        }
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
            book_id: sea_orm::ActiveValue::NotSet,
            order_id: sea_orm::ActiveValue::NotSet,
        }
    }
}

impl Model {
    /// 生成唯一 ID，格式为 YYYYMMDDNNNNN
    pub async fn generate_id<C: sea_orm::ConnectionTrait>(
        db: &C,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        // 获取当日的下一个序列号
        let next_seq = super::accounting_record_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

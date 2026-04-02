use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use crate::enums::{AccountingChannel, OrderType, OrderStatus};

/// 订单实体
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "order")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,
    /// 可读订单编号（格式 #N，如 #1, #2，当日序号）
    pub order_no: String,
    /// 订单类型（Sales / Purchase）
    pub order_type: OrderType,
    /// 关联客户 ID（散客为 None）
    pub customer_id: Option<i64>,
    /// 应收/应付总额
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub total_amount: Decimal,
    /// 实收/实付总额
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub actual_amount: Decimal,
    /// 订单状态
    pub status: OrderStatus,
    /// 支付/收款渠道（创建时默认 Unknown，结账时更新）
    pub channel: AccountingChannel,
    /// 结账时关联的记账记录 ID
    pub accounting_record_id: Option<i64>,
    /// 备注
    pub remark: Option<String>,
    /// 创建时间
    pub create_at: NaiveDateTime,
    /// 结账时间
    pub settled_at: Option<NaiveDateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {
    fn new() -> Self {
        use chrono::Local;
        let now = Local::now().naive_local();

        Self {
            id: sea_orm::ActiveValue::NotSet,
            order_no: sea_orm::ActiveValue::NotSet,
            order_type: sea_orm::ActiveValue::NotSet,
            customer_id: sea_orm::ActiveValue::NotSet,
            total_amount: sea_orm::ActiveValue::NotSet,
            actual_amount: sea_orm::ActiveValue::NotSet,
            status: sea_orm::ActiveValue::NotSet,
            channel: sea_orm::ActiveValue::NotSet,
            accounting_record_id: sea_orm::ActiveValue::NotSet,
            remark: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
            settled_at: sea_orm::ActiveValue::NotSet,
        }
    }
}

impl Model {
    /// 生成唯一订单 ID，格式：YYYYMMDDNNNNN
    pub async fn generate_id<C: sea_orm::ConnectionTrait>(db: &C) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        let next_seq = super::order_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

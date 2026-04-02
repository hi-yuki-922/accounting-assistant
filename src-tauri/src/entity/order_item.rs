use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;

/// 订单明细实体
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "order_item")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    /// 关联订单 ID
    pub order_id: i64,
    /// 关联商品 ID
    pub product_id: i64,
    /// 商品名称快照（冗余存储）
    pub product_name: String,
    /// 数量（支持小数）
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub quantity: Decimal,
    /// 计量单位快照（冗余存储）
    pub unit: String,
    /// 成交单价
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub unit_price: Decimal,
    /// 小计（= quantity × unit_price）
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub subtotal: Decimal,
    /// 备注
    pub remark: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

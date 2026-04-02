use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;

/// 商品实体
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "product")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,
    /// 商品名称
    pub name: String,
    /// 商品分类
    pub category: Option<String>,
    /// 计量单位（如斤、个、箱）
    pub unit: String,
    /// 参考售价
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub default_sell_price: Option<Decimal>,
    /// 参考采购价
    #[sea_orm(column_type = "Decimal(Some((19, 4)))")]
    pub default_purchase_price: Option<Decimal>,
    /// 商品编码
    pub sku: Option<String>,
    /// 检索关键词，多个关键词以分号分隔
    pub keywords: Option<String>,
    /// 备注
    pub remark: Option<String>,
    /// 创建时间
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
            unit: sea_orm::ActiveValue::NotSet,
            default_sell_price: sea_orm::ActiveValue::NotSet,
            default_purchase_price: sea_orm::ActiveValue::NotSet,
            sku: sea_orm::ActiveValue::NotSet,
            keywords: sea_orm::ActiveValue::NotSet,
            remark: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
        }
    }
}

impl Model {
    /// 生成唯一商品 ID，格式：YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        let next_seq = super::product_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

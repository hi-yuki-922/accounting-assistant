use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// 品类实体
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[sea_orm(table_name = "category")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i64,
    /// 品类名称，唯一
    pub name: String,
    /// 销售账本外键
    pub sell_book_id: i64,
    /// 进货账本外键
    pub purchase_book_id: i64,
    /// 备注
    pub remark: Option<String>,
    /// 创建时间
    pub create_at: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    AccountingBook,
    AccountingBook2,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::AccountingBook => Entity::belongs_to(super::accounting_book::Entity)
                .from(Column::SellBookId)
                .to(super::accounting_book::Column::Id)
                .into(),
            Self::AccountingBook2 => Entity::belongs_to(super::accounting_book::Entity)
                .from(Column::PurchaseBookId)
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
            name: sea_orm::ActiveValue::NotSet,
            sell_book_id: sea_orm::ActiveValue::NotSet,
            purchase_book_id: sea_orm::ActiveValue::NotSet,
            remark: sea_orm::ActiveValue::NotSet,
            create_at: sea_orm::ActiveValue::Set(now),
        }
    }
}

impl Model {
    /// 生成唯一品类 ID，格式：YYYYMMDDNNNNN
    pub async fn generate_id(db: &DatabaseConnection) -> Result<i64, Box<dyn std::error::Error>> {
        use chrono::Local;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        let date_int = date_str.parse::<i32>().unwrap_or(20210101);

        let next_seq = super::category_seq::Model::get_next_sequence(db, date_int).await?;

        let id_str = format!("{}{:05}", date_int, next_seq);
        Ok(id_str.parse::<i64>().unwrap())
    }
}

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_book_seq")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32, // 年份，格式为 yyyy

    pub seq: i32, // 流水号
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    /// 获取指定年份的下一个流水号
    pub async fn get_next_sequence(
        db: &DatabaseConnection,
        year: i32,
    ) -> Result<i32, Box<dyn std::error::Error>> {
        use sea_orm::TransactionTrait;

        // 开始事务确保原子性
        let txn = db.begin().await?;

        let seq_model = Entity::find().filter(Column::Id.eq(year)).one(&txn).await?;

        let next_seq = match seq_model {
            Some(model) => {
                // 更新现有序列
                let active_model: ActiveModel = ActiveModel {
                    id: ActiveValue::Unchanged(model.id),
                    seq: ActiveValue::Set(model.seq + 1),
                };

                active_model.update(&txn).await?;
                model.seq + 1
            }
            None => {
                // 创建新年份的序列，从 1 开始
                let new_seq = ActiveModel {
                    id: ActiveValue::Set(year),
                    seq: ActiveValue::Set(1),
                };

                new_seq.insert(&txn).await?;
                1
            }
        };

        txn.commit().await?;
        Ok(next_seq)
    }
}

use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record_seq")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32, // 日期，格式 YYYYMMDD

    pub seq: i32, // 当日序列号
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    pub async fn get_next_sequence<C: sea_orm::ConnectionTrait>(
        db: &C,
        date: i32,
    ) -> Result<i32, Box<dyn std::error::Error>> {
        let seq_model = Entity::find().filter(Column::Id.eq(date)).one(db).await?;

        let next_seq = match seq_model {
            Some(model) => {
                // 更新现有序列
                let active_model: ActiveModel = ActiveModel {
                    id: ActiveValue::Unchanged(model.id),
                    seq: ActiveValue::Set(model.seq + 1),
                };

                active_model.update(db).await?;
                model.seq + 1
            }
            None => {
                // 创建今日新序列，起始值为 1
                let new_seq = ActiveModel {
                    id: ActiveValue::Set(date),
                    seq: ActiveValue::Set(1),
                };

                new_seq.insert(db).await?;
                1
            }
        };

        Ok(next_seq)
    }
}

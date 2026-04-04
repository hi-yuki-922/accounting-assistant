use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue;

/// 订单 ID 序列实体
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "order_seq")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32, // 日期，格式 YYYYMMDD
    pub seq: i32, // 当日流水号
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    /// 获取下一个序列号
    pub async fn get_next_sequence<C: sea_orm::ConnectionTrait>(
        db: &C,
        date: i32,
    ) -> Result<i32, Box<dyn std::error::Error>> {
        let seq_model = Entity::find().filter(Column::Id.eq(date)).one(db).await?;

        let next_seq = match seq_model {
            Some(model) => {
                let active_model: ActiveModel = ActiveModel {
                    id: ActiveValue::Unchanged(model.id),
                    seq: ActiveValue::Set(model.seq + 1),
                };
                active_model.update(db).await?;
                model.seq + 1
            }
            None => {
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

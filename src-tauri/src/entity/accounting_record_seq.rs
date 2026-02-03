use serde::{Deserialize, Serialize};
use sea_orm::entity::prelude::*;
use sea_orm::{ActiveValue};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "accounting_record_seq")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: i32,  // Date in YYYYMMDD format
    
    pub seq: i32,  // Sequence number for the day
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

impl Model {
    pub async fn get_next_sequence(
        db: &sea_orm::DatabaseConnection,
        date: i32
    ) -> Result<i32, Box<dyn std::error::Error>> {
        use sea_orm::{ActiveValue, TransactionTrait};

        // Begin transaction to ensure atomicity
        let txn = db.begin().await?;

        let seq_model = Entity::find()
            .filter(Column::Id.eq(date))
            .one(&txn)
            .await?;

        let next_seq = match seq_model {
            Some(model) => {
                // Update the existing sequence
                let active_model: ActiveModel = ActiveModel {
                    id: sea_orm::ActiveValue::Unchanged(model.id),
                    seq: sea_orm::ActiveValue::Set(model.seq + 1),
                };

                active_model.update(&txn).await?;
                model.seq + 1
            },
            None => {
                // Create a new sequence for today starting at 1
                let new_seq = ActiveModel {
                    id: sea_orm::ActiveValue::Set(date),
                    seq: sea_orm::ActiveValue::Set(1),
                };

                new_seq.insert(&txn).await?;
                1
            }
        };

        txn.commit().await?;
        Ok(next_seq)
    }
}
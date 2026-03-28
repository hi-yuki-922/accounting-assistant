use crate::entity::accounting_record::{self, ActiveModel, Model};
use crate::enums::AccountingRecordState;
use chrono::Local;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use crate::services::accounting_book::DEFAULT_BOOK_ID;

pub mod dto;

use self::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};

/// 记账服务
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

impl AccountingService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 添加记账记录
    pub async fn add_record(
        &self,
        input: AddAccountingRecordDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        // Convert DTO fields to internal types
        let (amount, record_time, accounting_type, channel) = input.to_internal_types()?;

        // Generate a unique ID for the record
        let id = Model::generate_id(&self.db).await?;

        let book_id = input.book_id.unwrap_or(DEFAULT_BOOK_ID);

        let new_record = ActiveModel {
            id: sea_orm::ActiveValue::Set(id),
            amount: sea_orm::ActiveValue::Set(amount),
            record_time: sea_orm::ActiveValue::Set(record_time),
            accounting_type: sea_orm::ActiveValue::Set(accounting_type),
            title: sea_orm::ActiveValue::Set(input.title),
            channel: sea_orm::ActiveValue::Set(channel),
            remark: sea_orm::ActiveValue::Set(input.remark),
            write_off_id: sea_orm::ActiveValue::Set(input.write_off_id),
            create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
            state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
            book_id: sea_orm::ActiveValue::Set(Option::from(book_id)),
        };

        let inserted_record = new_record.insert(&self.db).await?;

        // 更新对应账本的 record_count
        use sea_orm::{EntityTrait, ColumnTrait, QueryFilter, Set, ActiveModelTrait};
        use crate::entity::accounting_book;

        let book = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(book_id))
            .one(&self.db)
            .await?;

        if let Some(b) = book {
            let mut active_book: accounting_book::ActiveModel = b.into();
            active_book.record_count = Set(active_book.record_count.as_ref() + 1);
            active_book.update(&self.db).await?;
        }

        Ok(inserted_record)
    }

    /// 修改记账记录
    pub async fn modify_record(
        &self,
        input: ModifyAccountingRecordDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        // Convert DTO fields to internal types
        let (amount, record_time, accounting_type) = input.to_internal_types()?;

        // First, fetch the current record to check its state
        let record = accounting_record::Entity::find_by_id(input.id)
            .one(&self.db)
            .await?
            .ok_or::<String>("Accounting record not found".into())?;

        // Check if the record is in PendingPosting state
        if record.state != AccountingRecordState::PendingPosting {
            return Err("Only records with state PendingPosting can be modified".into());
        }

        // Create active model for updates, only updating provided fields
        let mut active_model: ActiveModel = record.into();

        if let Some(new_amount) = amount {
            active_model.amount = sea_orm::ActiveValue::Set(new_amount);
        }

        if let Some(new_record_time) = record_time {
            active_model.record_time = sea_orm::ActiveValue::Set(new_record_time);
        }

        if let Some(new_accounting_type) = accounting_type {
            active_model.accounting_type = sea_orm::ActiveValue::Set(new_accounting_type);
        }

        if let Some(new_title) = input.title {
            active_model.title = sea_orm::ActiveValue::Set(new_title);
        }

        if let Some(new_remark) = input.remark {
            active_model.remark = sea_orm::ActiveValue::Set(new_remark);
        }

        // Update the record
        let updated_record = active_model.update(&self.db).await?;
        Ok(updated_record)
    }

    /// 过账记账记录
    pub async fn post_record(&self, id: i64) -> Result<Model, Box<dyn std::error::Error>> {
        // First, fetch the current record
        let record = accounting_record::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or::<String>("Accounting record not found".into())?;

        // Update the state to Posted
        let mut active_model: ActiveModel = record.into();
        active_model.state = sea_orm::ActiveValue::Set(AccountingRecordState::Posted);

        // Update the record
        let updated_record = active_model.update(&self.db).await?;
        Ok(updated_record)
    }
}

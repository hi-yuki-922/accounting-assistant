use crate::entity::accounting_record::{self, ActiveModel, Model};
use crate::db::connection;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};
use chrono::{NaiveDateTime, Local};
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, EntityTrait, QuerySelect, QueryFilter, sea_query::Expr, ColumnTrait};

pub mod dto;

use self::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};

pub async fn add_accounting_record(
    input: AddAccountingRecordDto,
) -> Result<accounting_record::Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;

    // Convert DTO fields to internal types
    let (amount, record_time, accounting_type, channel) = input.to_internal_types()?;

    // Generate a unique ID for the record
    let id = accounting_record::Model::generate_id(&*db).await?;

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
    };

    let inserted_record = new_record.insert(&*db).await?;
    Ok(inserted_record)
}

pub async fn modify_accounting_record(
    input: ModifyAccountingRecordDto,
) -> Result<Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;

    // Convert DTO fields to internal types
    let (amount, record_time, accounting_type) = input.to_internal_types()?;

    // First, fetch the current record to check its state
    let record = accounting_record::Entity::find_by_id(input.id)
        .one(&*db)
        .await?
        .ok_or("Accounting record not found".into())?;

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
    let updated_record = active_model.update(&*db).await?;
    Ok(updated_record)
}

pub async fn post_accounting_record(
    id: i64,
) -> Result<Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;

    // First, fetch the current record
    let record = accounting_record::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or("Accounting record not found".into())?;

    // Update the state to Posted
    let mut active_model: ActiveModel = record.into();
    active_model.state = sea_orm::ActiveValue::Set(AccountingRecordState::Posted);

    // Update the record
    let updated_record = active_model.update(&*db).await?;
    Ok(updated_record)
}


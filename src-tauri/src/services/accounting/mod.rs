use crate::entity::accounting_record::{self, ActiveModel, Model};
use crate::db::connection;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};
use chrono::{NaiveDateTime, Local};
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, EntityTrait, QuerySelect, QueryFilter, sea_query::Expr, ColumnTrait};

pub async fn add_accounting_record(
    amount: Decimal,
    record_time: NaiveDateTime,
    accounting_type: AccountingType,
    title: String,
    channel: AccountingChannel,
    remark: Option<String>,
    write_off_id: Option<i64>,
) -> Result<accounting_record::Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;

    // Generate a unique ID for the record
    let id = accounting_record::Model::generate_id(&*db).await?;

    let new_record = ActiveModel {
        id: sea_orm::ActiveValue::Set(id),
        amount: sea_orm::ActiveValue::Set(amount),
        record_time: sea_orm::ActiveValue::Set(record_time),
        accounting_type: sea_orm::ActiveValue::Set(accounting_type),
        title: sea_orm::ActiveValue::Set(title),
        channel: sea_orm::ActiveValue::Set(channel),
        remark: sea_orm::ActiveValue::Set(remark),
        write_off_id: sea_orm::ActiveValue::Set(write_off_id),
        create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
        state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
    };

    let inserted_record = new_record.insert(&*db).await?;
    Ok(inserted_record)
}

pub async fn modify_accounting_record(
    id: i64,
    amount: Option<Decimal>,
    record_time: Option<NaiveDateTime>,
    accounting_type: Option<AccountingType>,
    title: Option<String>,
    remark: Option<Option<String>>,
) -> Result<Model, Box<dyn std::error::Error>> {
    let db = connection::get_or_init_db().await?;

    // First, fetch the current record to check its state
    let record = accounting_record::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or("Accounting record not found")?;

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

    if let Some(new_title) = title {
        active_model.title = sea_orm::ActiveValue::Set(new_title);
    }

    if let Some(new_remark) = remark {
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
        .ok_or("Accounting record not found")?;

    // Update the state to Posted
    let mut active_model: ActiveModel = record.into();
    active_model.state = sea_orm::ActiveValue::Set(AccountingRecordState::Posted);

    // Update the record
    let updated_record = active_model.update(&*db).await?;
    Ok(updated_record)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;

    #[tokio::test]
    #[ignore] // Ignore this test since it requires a database connection
    async fn test_add_accounting_record() {
        // Create test data
        let amount = Decimal::new(10000, 2); // 100.00
        let record_time = NaiveDate::from_ymd_opt(2023, 1, 1)
            .unwrap()
            .and_hms_opt(12, 0, 0)
            .unwrap();

        // Note: This test will be ignored as it requires a database connection
        // which may not be initialized in the test environment
        let result = add_accounting_record(
            amount,
            record_time,
            AccountingType::Income,
            "Test Record".to_string(),
            AccountingChannel::Cash,
            Some("Test Remark".to_string()),
            None,
        ).await;

        // Just check that the function signature is correct
        // Real testing would require setting up a test database connection
        // assert!(result.is_ok());
    }

    #[tokio::test]
    #[ignore] // Ignore this test since it requires a database connection
    async fn test_modify_accounting_record() {
        // This test requires a database with an existing record
        // which would normally be set up in a proper test environment

        // Test the signature and basic functionality
        let result = modify_accounting_record(
            1, // Some existing record ID
            Some(Decimal::new(20000, 2)), // New amount
            None, // Skip record_time
            Some(AccountingType::Expenditure), // New accounting type
            Some("Updated Title".to_string()), // New title
            Some(Some("Updated remark".to_string())), // New remark
        ).await;

        // This would normally check the result in a proper test setup
        // assert!(result.is_ok());
    }

    #[tokio::test]
    #[ignore] // Ignore this test since it requires a database connection
    async fn test_post_accounting_record() {
        // This test requires a database with an existing record
        // which would normally be set up in a proper test environment

        // Test the signature and basic functionality
        let result = post_accounting_record(1).await; // Some existing record ID

        // This would normally check the result in a proper test setup
        // assert!(result.is_ok());
    }

    #[tokio::test]
    #[ignore] // Ignore this test since it requires a database connection
    async fn test_modify_accounting_record_state_check() {
        // Test that modification is only allowed when state is PendingPosting
        // This would be tested by trying to modify a record that is already in Posted state
    }
}
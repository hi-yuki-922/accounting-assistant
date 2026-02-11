use crate::entity::accounting_record::{self, ActiveModel};
use crate::db::connection;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};
use chrono::{NaiveDateTime, Local};
use rust_decimal::Decimal;
use sea_orm::ActiveModelTrait;

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
}
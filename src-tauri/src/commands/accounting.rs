use tauri::command;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};
use crate::services::accounting;

#[derive(Deserialize, Serialize)]
pub struct AddAccountingRecordDto {
    pub amount: f64,
    pub record_time: String,  // Format: "YYYY-MM-DD HH:MM:SS"
    pub accounting_type: String,
    pub title: String,
    pub channel: String,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
}

#[derive(Deserialize, Serialize)]
pub struct ModifyAccountingRecordDto {
    pub id: i64,
    pub amount: Option<f64>,                    // New amount as float
    pub record_time: Option<String>,           // Format: "YYYY-MM-DD HH:MM:SS"
    pub accounting_type: Option<String>,       // As string to match parsing
    pub title: Option<String>,                 // New title
    pub remark: Option<Option<String>>,        // New remark (Option<Option<String>>)
}

#[derive(Deserialize, Serialize)]
pub struct PostAccountingRecordDto {
    pub id: i64,
}

#[command]
pub async fn add_accounting_record(input: AddAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Convert f64 to Decimal
    let amount_decimal = Decimal::from_f64_retain(input.amount)
        .ok_or_else(|| "Invalid amount provided".to_string())?;

    // Parse date string to NaiveDateTime
    let parsed_datetime = NaiveDateTime::parse_from_str(&input.record_time, "%Y-%m-%d %H:%M:%S")
        .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;

    // Parse accounting type
    let parsed_accounting_type = input.accounting_type.parse::<AccountingType>()
        .map_err(|_| "Invalid accounting type".to_string())?;

    // Parse channel
    let parsed_channel = input.channel.parse::<AccountingChannel>()
        .map_err(|_| "Invalid accounting channel".to_string())?;

    // Call the service function
    accounting::add_accounting_record(
        amount_decimal,
        parsed_datetime,
        parsed_accounting_type,
        input.title,
        parsed_channel,
        input.remark,
        input.write_off_id,
    )
    .await
    .map_err(|e| e.to_string())
}

#[command]
pub async fn modify_accounting_record(input: ModifyAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Convert optional amount from f64 to Decimal if provided
    let amount_decimal = if let Some(amount_val) = input.amount {
        Some(Decimal::from_f64_retain(amount_val).ok_or_else(|| "Invalid amount provided".to_string())?)
    } else {
        None
    };

    // Parse optional date string to NaiveDateTime if provided
    let parsed_datetime = if let Some(date_str) = input.record_time {
        Some(NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?)
    } else {
        None
    };

    // Parse optional accounting type if provided
    let parsed_accounting_type = if let Some(type_str) = input.accounting_type {
        Some(type_str.parse::<AccountingType>()
            .map_err(|_| "Invalid accounting type".to_string())?)
    } else {
        None
    };

    // Call the service function
    accounting::modify_accounting_record(
        input.id,
        amount_decimal,
        parsed_datetime,
        parsed_accounting_type,
        input.title,
        input.remark,
    )
    .await
    .map_err(|e| e.to_string())
}

#[command]
pub async fn post_accounting_record(input: PostAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Call the service function
    accounting::post_accounting_record(
        input.id,
    )
    .await
    .map_err(|e| e.to_string())
}

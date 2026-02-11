use tauri::command;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use crate::enums::{AccountingType, AccountingChannel};
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

#[command]
pub async fn add_accounting_record(dto: AddAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Convert f64 to Decimal
    let amount_decimal = Decimal::from_f64_retain(dto.amount)
        .ok_or_else(|| "Invalid amount provided".to_string())?;

    // Parse date string to NaiveDateTime
    let parsed_datetime = NaiveDateTime::parse_from_str(&dto.record_time, "%Y-%m-%d %H:%M:%S")
        .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;

    // Parse accounting type
    let parsed_accounting_type = dto.accounting_type.parse::<AccountingType>()
        .map_err(|_| "Invalid accounting type".to_string())?;

    // Parse channel
    let parsed_channel = dto.channel.parse::<AccountingChannel>()
        .map_err(|_| "Invalid accounting channel".to_string())?;

    // Call the service function
    accounting::add_accounting_record(
        amount_decimal,
        parsed_datetime,
        parsed_accounting_type,
        dto.title,
        parsed_channel,
        dto.remark,
        dto.write_off_id,
    )
    .await
    .map_err(|e| e.to_string())
}
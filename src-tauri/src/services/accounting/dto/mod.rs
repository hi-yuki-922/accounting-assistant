use serde::{Deserialize, Serialize};
use crate::enums::{AccountingType, AccountingChannel};
use rust_decimal::Decimal;
use chrono::NaiveDateTime;

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


// Helper struct for converting DTO fields to internal types
impl AddAccountingRecordDto {
    pub fn to_internal_types(&self) -> Result<(Decimal, NaiveDateTime, AccountingType, AccountingChannel), String> {
        // Convert f64 to Decimal
        let amount_decimal = Decimal::from_f64_retain(self.amount)
            .ok_or_else(|| "Invalid amount provided".to_string())?;

        // Parse date string to NaiveDateTime
        let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;

        // Parse accounting type
        let parsed_accounting_type = self.accounting_type.parse::<AccountingType>()
            .map_err(|_| "Invalid accounting type".to_string())?;

        // Parse channel
        let parsed_channel = self.channel.parse::<AccountingChannel>()
            .map_err(|_| "Invalid accounting channel".to_string())?;

        Ok((amount_decimal, parsed_datetime, parsed_accounting_type, parsed_channel))
    }
}

impl ModifyAccountingRecordDto {
    pub fn to_internal_types(&self) -> Result<(Option<Decimal>, Option<NaiveDateTime>, Option<AccountingType>), String> {
        // Convert optional amount from f64 to Decimal if provided
        let amount_decimal = if let Some(amount_val) = self.amount {
            Some(Decimal::from_f64_retain(amount_val).ok_or_else(|| "Invalid amount provided".to_string())?)
        } else {
            None
        };

        // Parse optional date string to NaiveDateTime if provided
        let parsed_datetime = if let Some(date_str) = self.record_time.as_ref() {
            Some(NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%d %H:%M:%S")
                .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?)
        } else {
            None
        };

        // Parse optional accounting type if provided
        let parsed_accounting_type = if let Some(type_str) = self.accounting_type.as_ref() {
            Some(type_str.parse::<AccountingType>()
                .map_err(|_| "Invalid accounting type".to_string())?)
        } else {
            None
        };

        Ok((amount_decimal, parsed_datetime, parsed_accounting_type))
    }
}

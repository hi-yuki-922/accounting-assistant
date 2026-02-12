use tauri::command;
use serde::{Deserialize, Serialize};
use crate::services::accounting;
use crate::services::accounting::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};

#[command]
pub async fn add_accounting_record(input: AddAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Call the service function
    accounting::add_accounting_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn modify_accounting_record(input: ModifyAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Call the service function
    accounting::modify_accounting_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn post_accounting_record(id: i64) -> Result<crate::entity::accounting_record::Model, String> {
    // Call the service function with just the ID
    accounting::post_accounting_record(id)
        .await
        .map_err(|e| e.to_string())
}

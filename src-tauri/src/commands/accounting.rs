use tauri::command;
use serde::{Deserialize, Serialize};
use crate::services;
use crate::services::accounting::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};

#[command]
pub async fn add_accounting_record(input: AddAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Get the service singleton and call the method
    let service = services::accounting_service();
    service.add_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn modify_accounting_record(input: ModifyAccountingRecordDto) -> Result<crate::entity::accounting_record::Model, String> {
    // Get the service singleton and call the method
    let service = services::accounting_service();
    service.modify_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn post_accounting_record(id: i64) -> Result<crate::entity::accounting_record::Model, String> {
    // Get the service singleton and call the method
    let service = services::accounting_service();
    service.post_record(id)
        .await
        .map_err(|e| e.to_string())
}

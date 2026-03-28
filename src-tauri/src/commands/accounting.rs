use tauri::command;
use tauri::State;
use crate::services::accounting::AccountingService;
use crate::services::accounting::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};

#[command]
pub async fn add_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.add_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn modify_accounting_record(
    service: State<'_, AccountingService>,
    input: ModifyAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.modify_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn post_accounting_record(
    service: State<'_, AccountingService>,
    id: i64,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.post_record(id)
        .await
        .map_err(|e| e.to_string())
}

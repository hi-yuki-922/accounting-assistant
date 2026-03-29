use tauri::command;
use tauri::State;
use crate::services::accounting::AccountingService;
use crate::services::accounting::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto, BatchPostRecordsDto, CreateWriteOffRecordDto};

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

/// 删除记账记录（仅限待入账记录）
#[command]
pub async fn delete_accounting_record(
    service: State<'_, AccountingService>,
    id: i64,
) -> Result<bool, String> {
    service.delete_record(id)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}

/// 批量入账
#[command]
pub async fn batch_post_accounting_records(
    service: State<'_, AccountingService>,
    input: BatchPostRecordsDto,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service.batch_post_records(input.record_ids)
        .await
        .map_err(|e| e.to_string())
}

/// 创建冲账记录
#[command]
pub async fn create_write_off_record(
    service: State<'_, AccountingService>,
    input: CreateWriteOffRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.create_write_off_record(input)
        .await
        .map_err(|e| e.to_string())
}

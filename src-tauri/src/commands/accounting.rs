use crate::services::accounting::dto::{
    AddAccountingRecordDto, BatchPostRecordsDto, CreateWriteOffRecordDto, ModifyAccountingRecordDto,
};
use crate::services::accounting::AccountingService;
use tauri::State;

#[tauri::command]
pub async fn create_accounting_record(
    service: State<'_, AccountingService>,
    input: AddAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service
        .create_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_accounting_record(
    service: State<'_, AccountingService>,
    input: ModifyAccountingRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service
        .update_record(input)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn post_accounting_record(
    service: State<'_, AccountingService>,
    id: i64,
) -> Result<crate::entity::accounting_record::Model, String> {
    service.post_record(id).await.map_err(|e| e.to_string())
}

/// 删除记账记录（仅限待入账记录）
#[tauri::command]
pub async fn delete_accounting_record(
    service: State<'_, AccountingService>,
    id: i64,
) -> Result<bool, String> {
    service
        .delete_record(id)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}

/// 批量入账
#[tauri::command]
pub async fn batch_post_accounting_records(
    service: State<'_, AccountingService>,
    input: BatchPostRecordsDto,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service
        .batch_post_records(input.record_ids)
        .await
        .map_err(|e| e.to_string())
}

/// 创建冲账记录
#[tauri::command]
pub async fn create_write_off_record(
    service: State<'_, AccountingService>,
    input: CreateWriteOffRecordDto,
) -> Result<crate::entity::accounting_record::Model, String> {
    service
        .create_write_off_record(input)
        .await
        .map_err(|e| e.to_string())
}

/// 根据订单 ID 查询关联的记账记录
#[tauri::command]
pub async fn get_records_by_order_id(
    service: State<'_, AccountingService>,
    order_id: i64,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service
        .get_records_by_order_id(order_id)
        .await
        .map_err(|e| e.to_string())
}

use crate::entity::accounting_book;
use crate::services::accounting_book::{
    dto::{
        CreateBookDto, GetBooksPaginatedDto, GetRecordsByBookIdPaginatedDto, PaginatedResponse,
        RecordWithCountDto, RecordWriteOffDetailsDto, UpdateBookDto,
    },
    AccountingBookService,
};
use tauri::State;

/// 创建账本
#[tauri::command]
pub async fn create_book(
    service: State<'_, AccountingBookService>,
    input: CreateBookDto,
) -> Result<accounting_book::Model, String> {
    service.create_book(input).await.map_err(|e| e.to_string())
}

/// 查询所有账本
#[tauri::command]
pub async fn get_all_books(
    service: State<'_, AccountingBookService>,
) -> Result<Vec<accounting_book::Model>, String> {
    service.get_all_books().await.map_err(|e| e.to_string())
}

/// 根据 ID 查询单个账本
#[tauri::command]
pub async fn get_book_by_id(
    service: State<'_, AccountingBookService>,
    id: i64,
) -> Result<Option<accounting_book::Model>, String> {
    service.get_book_by_id(id).await.map_err(|e| e.to_string())
}

/// 更新账本信息
#[tauri::command]
pub async fn update_book(
    service: State<'_, AccountingBookService>,
    input: UpdateBookDto,
) -> Result<Option<accounting_book::Model>, String> {
    service.update_book(input).await.map_err(|e| e.to_string())
}

/// 删除账本
#[tauri::command]
pub async fn delete_book(
    service: State<'_, AccountingBookService>,
    id: i64,
) -> Result<bool, String> {
    service.delete_book(id).await.map_err(|e| e.to_string())
}

/// 查询指定账本下的所有记录
#[tauri::command]
pub async fn get_records_by_book_id(
    service: State<'_, AccountingBookService>,
    book_id: i64,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service
        .get_records_by_book_id(book_id)
        .await
        .map_err(|e| e.to_string())
}

/// 查询未归类账目（包括 NULL 和默认账本的记录）
#[tauri::command]
pub async fn get_uncategorized_records(
    service: State<'_, AccountingBookService>,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service
        .get_uncategorized_records()
        .await
        .map_err(|e| e.to_string())
}

/// 分页查询账本列表
#[tauri::command]
pub async fn get_books_paginated(
    service: State<'_, AccountingBookService>,
    input: GetBooksPaginatedDto,
) -> Result<crate::services::accounting_book::dto::PaginatedResponse<accounting_book::Model>, String>
{
    service
        .get_books_paginated(input)
        .await
        .map_err(|e| e.to_string())
}

/// 分页查询指定账本下的记账记录
#[tauri::command]
pub async fn get_records_by_book_id_paginated(
    service: State<'_, AccountingBookService>,
    input: GetRecordsByBookIdPaginatedDto,
) -> Result<PaginatedResponse<RecordWithCountDto>, String> {
    service
        .get_records_by_book_id_paginated(input)
        .await
        .map_err(|e| e.to_string())
}

/// 根据记录 ID 查询冲账关联记录
#[tauri::command]
pub async fn get_write_off_records_by_id(
    service: State<'_, AccountingBookService>,
    record_id: i64,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    service
        .get_write_off_records_by_id(record_id)
        .await
        .map_err(|e| e.to_string())
}

/// 查询记录的冲账详情（HoverCard 按需加载）
#[tauri::command]
pub async fn get_record_write_off_details(
    service: State<'_, AccountingBookService>,
    record_id: i64,
) -> Result<RecordWriteOffDetailsDto, String> {
    service
        .get_record_write_off_details(record_id)
        .await
        .map_err(|e| e.to_string())
}

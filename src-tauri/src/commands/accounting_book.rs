use crate::entity::accounting_book;
use crate::services::accounting_book::dto::{CreateBookDto, UpdateBookTitleDto, GetBooksPaginatedDto, GetRecordsByBookIdPaginatedDto};
use sea_orm::DatabaseConnection;
use tauri::State;

/// 创建账本
#[tauri::command]
pub async fn create_book(
    db: State<'_, DatabaseConnection>,
    input: CreateBookDto,
) -> Result<accounting_book::Model, String> {
    crate::services::accounting_book::create_book(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 查询所有账本
#[tauri::command]
pub async fn get_books(
    db: State<'_, DatabaseConnection>,
) -> Result<Vec<accounting_book::Model>, String> {
    crate::services::accounting_book::get_books(&db)
        .await
        .map_err(|e| e.to_string())
}

/// 根据 ID 查询单个账本
#[tauri::command]
pub async fn get_book_by_id(
    db: State<'_, DatabaseConnection>,
    id: i64,
) -> Result<Option<accounting_book::Model>, String> {
    crate::services::accounting_book::get_book_by_id(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 修改账本标题
#[tauri::command]
pub async fn update_book_title(
    db: State<'_, DatabaseConnection>,
    input: UpdateBookTitleDto,
) -> Result<Option<accounting_book::Model>, String> {
    crate::services::accounting_book::update_book_title(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除账本
#[tauri::command]
pub async fn delete_book(
    db: State<'_, DatabaseConnection>,
    id: i64,
) -> Result<bool, String> {
    crate::services::accounting_book::delete_book(&db, id)
        .await
        .map_err(|e| e.to_string())
}

/// 查询指定账本下的所有记录
#[tauri::command]
pub async fn get_records_by_book_id(
    db: State<'_, DatabaseConnection>,
    book_id: i64,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    crate::services::accounting_book::get_records_by_book_id(&db, book_id)
        .await
        .map_err(|e| e.to_string())
}

/// 查询未归类账目（包括 NULL 和默认账本的记录）
#[tauri::command]
pub async fn get_uncategorized_records(
    db: State<'_, DatabaseConnection>,
) -> Result<Vec<crate::entity::accounting_record::Model>, String> {
    crate::services::accounting_book::get_uncategorized_records(&db)
        .await
        .map_err(|e| e.to_string())
}

/// 分页查询账本列表
#[tauri::command]
pub async fn get_books_paginated(
    db: State<'_, DatabaseConnection>,
    input: GetBooksPaginatedDto,
) -> Result<crate::services::accounting_book::dto::PaginatedResponse<accounting_book::Model>, String> {
    crate::services::accounting_book::get_books_paginated(&db, input)
        .await
        .map_err(|e| e.to_string())
}

/// 分页查询指定账本下的记账记录
#[tauri::command]
pub async fn get_records_by_book_id_paginated(
    db: State<'_, DatabaseConnection>,
    input: GetRecordsByBookIdPaginatedDto,
) -> Result<crate::services::accounting_book::dto::PaginatedResponse<crate::entity::accounting_record::Model>, String> {
    crate::services::accounting_book::get_records_by_book_id_paginated(&db, input)
        .await
        .map_err(|e| e.to_string())
}

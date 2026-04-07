use crate::entity::category;
use crate::services::category::dto::{CreateCategoryDto, UpdateCategoryDto};
use crate::services::category::CategoryService;
use tauri::State;

/// 创建品类
#[tauri::command]
pub async fn create_category(
    service: State<'_, CategoryService>,
    input: CreateCategoryDto,
) -> Result<category::Model, String> {
    service
        .create_category(input)
        .await
        .map_err(|e| e.to_string())
}

/// 更新品类
#[tauri::command]
pub async fn update_category(
    service: State<'_, CategoryService>,
    input: UpdateCategoryDto,
) -> Result<category::Model, String> {
    service
        .update_category(input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除品类
#[tauri::command]
pub async fn delete_category(service: State<'_, CategoryService>, id: i64) -> Result<bool, String> {
    service
        .delete_category(id)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}

/// 查询所有品类
#[tauri::command]
pub async fn get_all_categories(
    service: State<'_, CategoryService>,
) -> Result<Vec<category::Model>, String> {
    service
        .get_all_categories()
        .await
        .map_err(|e| e.to_string())
}

/// 根据 ID 查询品类
#[tauri::command]
pub async fn get_category_by_id(
    service: State<'_, CategoryService>,
    id: i64,
) -> Result<category::Model, String> {
    service
        .get_category_by_id(id)
        .await
        .map_err(|e| e.to_string())
}

use crate::services::product::dto::{CreateProductDto, UpdateProductDto};
use crate::services::product::ProductService;
use tauri::State;

/// 创建商品
#[tauri::command]
pub async fn create_product(
    service: State<'_, ProductService>,
    input: CreateProductDto,
) -> Result<crate::entity::product::Model, String> {
    service
        .create_product(input)
        .await
        .map_err(|e| e.to_string())
}

/// 更新商品
#[tauri::command]
pub async fn update_product(
    service: State<'_, ProductService>,
    input: UpdateProductDto,
) -> Result<crate::entity::product::Model, String> {
    service
        .update_product(input)
        .await
        .map_err(|e| e.to_string())
}

/// 删除商品
#[tauri::command]
pub async fn delete_product(service: State<'_, ProductService>, id: i64) -> Result<bool, String> {
    service
        .delete_product(id)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}

/// 获取所有商品
#[tauri::command]
pub async fn get_all_products(
    service: State<'_, ProductService>,
) -> Result<Vec<crate::entity::product::Model>, String> {
    service.get_all_products().await.map_err(|e| e.to_string())
}

/// 根据 ID 获取商品
#[tauri::command]
pub async fn get_product_by_id(
    service: State<'_, ProductService>,
    id: i64,
) -> Result<crate::entity::product::Model, String> {
    service
        .get_product_by_id(id)
        .await
        .map_err(|e| e.to_string())
}

/// 搜索商品
#[tauri::command]
pub async fn search_products(
    service: State<'_, ProductService>,
    keyword: String,
) -> Result<Vec<crate::entity::product::Model>, String> {
    service
        .search_products(keyword)
        .await
        .map_err(|e| e.to_string())
}

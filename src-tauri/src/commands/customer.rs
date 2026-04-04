use crate::services::customer::dto::{CreateCustomerDto, UpdateCustomerDto};
use crate::services::customer::CustomerService;
use tauri::State;

#[tauri::command]
pub async fn create_customer(
    service: State<'_, CustomerService>,
    input: CreateCustomerDto,
) -> Result<crate::entity::customer::Model, String> {
    service
        .create_customer(input)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_customer(
    service: State<'_, CustomerService>,
    input: UpdateCustomerDto,
) -> Result<crate::entity::customer::Model, String> {
    service
        .update_customer(input)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_customer(service: State<'_, CustomerService>, id: i64) -> Result<bool, String> {
    service
        .delete_customer(id)
        .await
        .map(|_| true)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_customers(
    service: State<'_, CustomerService>,
) -> Result<Vec<crate::entity::customer::Model>, String> {
    service.get_all_customers().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_customer_by_id(
    service: State<'_, CustomerService>,
    id: i64,
) -> Result<crate::entity::customer::Model, String> {
    service
        .get_customer_by_id(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_customers(
    service: State<'_, CustomerService>,
    keyword: String,
) -> Result<Vec<crate::entity::customer::Model>, String> {
    service
        .search_customers(keyword)
        .await
        .map_err(|e| e.to_string())
}

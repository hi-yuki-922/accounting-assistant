use crate::entity::order::Model as OrderModel;
use crate::entity::order_item::Model as OrderItemModel;
use crate::services::order::dto::{
    CreateOrderDto, QueryOrdersDto, SettleOrderDto, SettlePreview, UpdateOrderDto,
};
use crate::services::order::OrderService;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use tauri::State;

/// 订单详情返回类型（订单 + 明细列表）
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderDetail {
    pub order: OrderModel,
    pub items: Vec<OrderItemModel>,
}

/// 分页查询结果返回类型
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryOrdersResult {
    pub orders: Vec<OrderModel>,
    pub total: u64,
}

/// 创建订单
#[tauri::command]
pub async fn create_order(
    service: State<'_, OrderService>,
    input: CreateOrderDto,
) -> Result<OrderModel, String> {
    service.create_order(input).await.map_err(|e| e.to_string())
}

/// 结账订单
#[tauri::command]
pub async fn settle_order(
    service: State<'_, OrderService>,
    input: SettleOrderDto,
) -> Result<OrderModel, String> {
    service.settle_order(input).await.map_err(|e| e.to_string())
}

/// 获取结算预览
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetSettlePreviewInput {
    pub order_id: i64,
    pub actual_amount: Option<Decimal>,
}

#[tauri::command]
pub async fn get_settle_preview(
    service: State<'_, OrderService>,
    input: GetSettlePreviewInput,
) -> Result<SettlePreview, String> {
    service
        .get_settle_preview(input.order_id, input.actual_amount)
        .await
        .map_err(|e| e.to_string())
}

/// 取消订单
#[tauri::command]
pub async fn cancel_order(service: State<'_, OrderService>, id: i64) -> Result<OrderModel, String> {
    service.cancel_order(id).await.map_err(|e| e.to_string())
}

/// 编辑订单
#[tauri::command]
pub async fn update_order(
    service: State<'_, OrderService>,
    input: UpdateOrderDto,
) -> Result<OrderModel, String> {
    service.update_order(input).await.map_err(|e| e.to_string())
}

/// 获取所有订单
#[tauri::command]
pub async fn get_all_orders(service: State<'_, OrderService>) -> Result<Vec<OrderModel>, String> {
    service.get_all_orders().await.map_err(|e| e.to_string())
}

/// 根据 ID 获取订单详情
#[tauri::command]
pub async fn get_order_by_id(
    service: State<'_, OrderService>,
    id: i64,
) -> Result<Option<OrderDetail>, String> {
    service
        .get_order_by_id(id)
        .await
        .map(|opt| opt.map(|(order, items)| OrderDetail { order, items }))
        .map_err(|e| e.to_string())
}

/// 根据客户 ID 获取订单列表
#[tauri::command]
pub async fn get_orders_by_customer_id(
    service: State<'_, OrderService>,
    customer_id: i64,
) -> Result<Vec<OrderModel>, String> {
    service
        .get_orders_by_customer_id(customer_id)
        .await
        .map_err(|e| e.to_string())
}

/// 根据状态获取订单列表
#[tauri::command]
pub async fn get_orders_by_status(
    service: State<'_, OrderService>,
    status: String,
) -> Result<Vec<OrderModel>, String> {
    service
        .get_orders_by_status(status)
        .await
        .map_err(|e| e.to_string())
}

/// 分页查询订单
#[tauri::command]
pub async fn query_orders(
    service: State<'_, OrderService>,
    input: QueryOrdersDto,
) -> Result<QueryOrdersResult, String> {
    service
        .query_orders(input)
        .await
        .map(|(orders, total)| QueryOrdersResult { orders, total })
        .map_err(|e| e.to_string())
}

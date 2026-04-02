use tauri::command;
use tauri::State;
use crate::services::order::OrderService;
use crate::services::order::dto::{CreateOrderDto, QueryOrdersDto, SettleOrderDto, UpdateOrderDto};
use crate::entity::order::Model as OrderModel;
use crate::entity::order_item::Model as OrderItemModel;

/// 订单详情返回类型（订单 + 明细列表）
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderDetail {
    pub order: OrderModel,
    pub items: Vec<OrderItemModel>,
}

/// 分页查询结果返回类型
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryOrdersResult {
    pub orders: Vec<OrderModel>,
    pub total: u64,
}

#[command]
pub async fn create_order(
    service: State<'_, OrderService>,
    input: CreateOrderDto,
) -> Result<OrderModel, String> {
    service.create_order(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn settle_order(
    service: State<'_, OrderService>,
    input: SettleOrderDto,
) -> Result<OrderModel, String> {
    service.settle_order(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn cancel_order(
    service: State<'_, OrderService>,
    id: i64,
) -> Result<OrderModel, String> {
    service.cancel_order(id)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn update_order(
    service: State<'_, OrderService>,
    input: UpdateOrderDto,
) -> Result<OrderModel, String> {
    service.update_order(input)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_all_orders(
    service: State<'_, OrderService>,
) -> Result<Vec<OrderModel>, String> {
    service.get_all_orders()
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_order_by_id(
    service: State<'_, OrderService>,
    id: i64,
) -> Result<Option<OrderDetail>, String> {
    service.get_order_by_id(id)
        .await
        .map(|opt| opt.map(|(order, items)| OrderDetail { order, items }))
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_orders_by_customer_id(
    service: State<'_, OrderService>,
    customer_id: i64,
) -> Result<Vec<OrderModel>, String> {
    service.get_orders_by_customer_id(customer_id)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_orders_by_status(
    service: State<'_, OrderService>,
    status: String,
) -> Result<Vec<OrderModel>, String> {
    service.get_orders_by_status(status)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn query_orders(
    service: State<'_, OrderService>,
    input: QueryOrdersDto,
) -> Result<QueryOrdersResult, String> {
    service.query_orders(input)
        .await
        .map(|(orders, total)| QueryOrdersResult { orders, total })
        .map_err(|e| e.to_string())
}

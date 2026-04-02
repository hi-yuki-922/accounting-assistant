use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 创建订单 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderDto {
    /// 订单类型（Sales / Purchase）
    pub order_type: String,
    /// 客户 ID（散客为 None）
    pub customer_id: Option<i64>,
    /// 支付渠道
    pub channel: String,
    /// 订单明细列表
    pub items: Vec<CreateOrderItemDto>,
    /// 备注
    pub remark: Option<String>,
    /// 实收金额（可选，默认等于应收总额）
    pub actual_amount: Option<Decimal>,
}

/// 创建订单明细 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderItemDto {
    /// 商品 ID
    pub product_id: i64,
    /// 商品名称（冗余快照）
    pub product_name: String,
    /// 数量
    pub quantity: Decimal,
    /// 单位（冗余快照）
    pub unit: String,
    /// 单价
    pub unit_price: Decimal,
    /// 备注
    pub remark: Option<String>,
}

/// 结账订单 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettleOrderDto {
    /// 订单 ID
    pub order_id: i64,
    /// 实收金额（可选，不传则使用订单已有的 actual_amount）
    pub actual_amount: Option<Decimal>,
}

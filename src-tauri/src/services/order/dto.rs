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
    /// 客户名称（冗余快照，与 customer_id 一同传入）
    pub customer_name: Option<String>,
    /// 订单明细列表
    pub items: Vec<CreateOrderItemDto>,
    /// 备注
    pub remark: Option<String>,
    /// 实收金额（可选，默认等于应收总额）
    pub actual_amount: Option<Decimal>,
    /// 订单业务类型（可选，不传则自动填充默认值）
    pub sub_type: Option<String>,
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
    /// 支付渠道（必填）
    pub channel: String,
    /// 实收金额（可选，不传则使用订单已有的 actual_amount）
    pub actual_amount: Option<Decimal>,
}

/// 编辑订单 DTO（仅允许修改明细和备注，不可修改类型和客户）
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateOrderDto {
    /// 订单 ID（必填）
    pub order_id: i64,
    /// 订单明细列表（可选，传入则替换原有明细）
    pub items: Option<Vec<CreateOrderItemDto>>,
    /// 备注（可选，传入则更新备注）
    pub remark: Option<String>,
}

/// 结算预览 — 品类分组项
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettlePreviewItem {
    /// 品类 ID
    pub category_id: i64,
    /// 品类名称
    pub category_name: String,
    /// 该品类的记账金额（小计之和）
    pub amount: Decimal,
    /// 目标账本 ID
    pub book_id: i64,
    /// 目标账本名称
    pub book_name: String,
}

/// 结算预览 — 折扣冲账项
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteOffPreviewItem {
    /// 品类名称
    pub category_name: String,
    /// 冲账金额（负数）
    pub write_off_amount: Decimal,
    /// 关联主记录品类分组索引
    pub category_id: i64,
}

/// 结算预览结果
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettlePreview {
    /// 按品类分组的主记录预览
    pub category_groups: Vec<SettlePreviewItem>,
    /// 折扣冲账预览（仅在 total_amount != actual_amount 时有值）
    pub write_off_preview: Option<Vec<WriteOffPreviewItem>>,
    /// 折扣总额（total_amount - actual_amount）
    pub discount_amount: Option<Decimal>,
}

/// 分页查询订单 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryOrdersDto {
    /// 页码（从 1 开始）
    pub page: Option<u64>,
    /// 每页条数
    pub page_size: Option<u64>,
    /// 开始时间（ISO 格式）
    pub start_time: Option<String>,
    /// 结束时间（ISO 格式）
    pub end_time: Option<String>,
    /// 订单状态筛选
    pub status: Option<String>,
    /// 最小金额
    pub min_amount: Option<Decimal>,
    /// 最大金额
    pub max_amount: Option<Decimal>,
    /// 支付渠道筛选
    pub channel: Option<String>,
    /// 订单类型筛选
    pub order_type: Option<String>,
}

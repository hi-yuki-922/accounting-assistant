use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 创建商品 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProductDto {
    /// 商品名称（必填）
    pub name: String,
    /// 品类 ID（可选）
    pub category_id: Option<i64>,
    /// 品类名称（冗余）
    pub category: Option<String>,
    /// 计量单位（必填）
    pub unit: String,
    /// 参考售价（可选）
    pub default_sell_price: Option<Decimal>,
    /// 参考采购价（可选）
    pub default_purchase_price: Option<Decimal>,
    /// 商品编码（可选）
    pub sku: Option<String>,
    /// 检索关键词，多个以分号分隔（可选）
    pub keywords: Option<String>,
    /// 备注（可选）
    pub remark: Option<String>,
}

/// 修改商品 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProductDto {
    /// 商品 ID
    pub id: i64,
    /// 品类 ID
    pub category_id: Option<Option<i64>>,
    /// 品类名称（冗余）
    pub category: Option<Option<String>>,
    /// 商品名称
    pub name: Option<String>,
    /// 计量单位
    pub unit: Option<String>,
    /// 参考售价
    pub default_sell_price: Option<Option<Decimal>>,
    /// 参考采购价
    pub default_purchase_price: Option<Option<Decimal>>,
    /// 商品编码
    pub sku: Option<Option<String>>,
    /// 检索关键词
    pub keywords: Option<Option<String>>,
    /// 备注
    pub remark: Option<Option<String>>,
}

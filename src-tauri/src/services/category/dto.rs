use serde::{Deserialize, Serialize};

/// 创建品类 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCategoryDto {
    /// 品类名称
    pub name: String,
    /// 销售账本 ID
    pub sell_book_id: i64,
    /// 进货账本 ID
    pub purchase_book_id: i64,
    /// 备注
    pub remark: Option<String>,
}

/// 更新品类 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCategoryDto {
    /// 品类 ID
    pub id: i64,
    /// 品类名称
    pub name: Option<String>,
    /// 销售账本 ID
    pub sell_book_id: Option<i64>,
    /// 进货账本 ID
    pub purchase_book_id: Option<i64>,
    /// 备注
    pub remark: Option<Option<String>>,
}

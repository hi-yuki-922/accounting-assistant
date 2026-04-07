use serde::{Deserialize, Serialize};

/// 创建客户 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCustomerDto {
    /// 客户姓名（必填）
    pub name: String,
    /// 客户分类（必填）：Retailer / Supplier
    pub category: String,
    /// 联系电话（必填）
    pub phone: String,
    /// 微信号（可选）
    pub wechat: Option<String>,
    /// 地址（可选）
    pub address: Option<String>,
    /// 银行账号（可选）
    pub bank_account: Option<String>,
    /// 备注（可选）
    pub remark: Option<String>,
}

/// 修改客户 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCustomerDto {
    /// 客户 ID
    pub id: i64,
    /// 客户姓名
    pub name: Option<String>,
    /// 客户分类：Retailer / Supplier
    pub category: Option<String>,
    /// 联系电话
    pub phone: Option<String>,
    /// 微信号
    pub wechat: Option<Option<String>>,
    /// 地址
    pub address: Option<Option<String>>,
    /// 银行账号
    pub bank_account: Option<Option<String>>,
    /// 备注
    pub remark: Option<Option<String>>,
}

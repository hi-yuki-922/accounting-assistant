use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use crate::entity::accounting_record;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};

/// 创建账本 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBookDto {
    pub title: String,
    pub description: Option<String>,
    /// 账本图标（可选）
    pub icon: Option<String>,
}

/// 更新账本 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBookDto {
    pub id: i64,
    pub title: Option<String>,
    pub description: Option<Option<String>>,
    /// 账本图标（可选，设置为 Some(None) 表示清空图标）
    pub icon: Option<Option<String>>,
}

/// 修改账本标题 DTO（已弃用，请使用 UpdateBookDto）
#[deprecated(since = "0.1.1", note = "请使用 UpdateBookDto 代替")]
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateBookTitleDto {
    pub id: i64,
    pub new_title: String,
}

/// 分页查询账本请求 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetBooksPaginatedDto {
    /// 页码，从 1 开始
    pub page: u64,
    /// 每页数量
    pub page_size: u64,
}

/// 分页查询账本记录请求 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetRecordsByBookIdPaginatedDto {
    /// 账本 ID
    pub book_id: i64,
    /// 页码，从 1 开始
    pub page: u64,
    /// 每页数量
    pub page_size: u64,
    /// 开始时间（可选）
    pub start_time: Option<chrono::NaiveDateTime>,
    /// 结束时间（可选）
    pub end_time: Option<chrono::NaiveDateTime>,
    /// 记账类型（可选）
    pub accounting_type: Option<AccountingType>,
    /// 记账渠道（可选）
    pub channel: Option<AccountingChannel>,
    /// 记录状态（可选）
    pub state: Option<AccountingRecordState>,
}

/// 带关联记录数量的记录 DTO
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordWithCountDto {
    /// 原始记账记录
    #[serde(flatten)]
    pub record: accounting_record::Model,
    /// 冲账关联记录数量
    pub related_count: i64,
    /// 原始金额（冲账前）
    pub original_amount: Decimal,
    /// 净金额（原始金额 + 冲账金额合计）
    pub net_amount: Decimal,
}

/// 冲账记录简要信息 DTO（用于 HoverCard 展示）
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteOffRecordDto {
    pub id: i64,
    pub amount: Decimal,
    pub record_time: NaiveDateTime,
    pub remark: Option<String>,
    pub channel: AccountingChannel,
}

/// 冲账详情 DTO（HoverCard 按需加载）
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordWriteOffDetailsDto {
    /// 原始金额
    pub original_amount: Decimal,
    /// 冲账记录列表
    pub write_off_records: Vec<WriteOffRecordDto>,
}

/// 分页响应结构
#[derive(Serialize)]
#[serde(bound(serialize = "T: Serialize"))]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponse<T> {
    /// 数据列表
    pub data: Vec<T>,
    /// 总数量
    pub total: u64,
    /// 当前页码
    pub page: u64,
    /// 每页数量
    pub page_size: u64,
    /// 总页数
    pub total_pages: u64,
}

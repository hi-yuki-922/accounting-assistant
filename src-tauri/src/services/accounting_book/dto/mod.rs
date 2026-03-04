use serde::{Deserialize, Serialize};
use crate::entity::accounting_record;
use crate::enums::{AccountingType, AccountingChannel, AccountingRecordState};

/// 创建账本 DTO
#[derive(Deserialize, Serialize)]
pub struct CreateBookDto {
    pub title: String,
}

/// 修改账本标题 DTO
#[derive(Deserialize, Serialize)]
pub struct UpdateBookTitleDto {
    pub id: i64,
    pub new_title: String,
}

/// 分页查询账本请求 DTO
#[derive(Deserialize, Serialize)]
pub struct GetBooksPaginatedDto {
    /// 页码，从 1 开始
    pub page: u64,
    /// 每页数量
    pub page_size: u64,
}

/// 分页查询账本记录请求 DTO
#[derive(Deserialize, Serialize)]
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
pub struct RecordWithCountDto {
    /// 原始记账记录
    #[serde(flatten)]
    pub record: accounting_record::Model,
    /// 冲账关联记录数量
    pub related_count: i64,
}

/// 分页响应结构
#[derive(Serialize)]
#[serde(bound(serialize = "T: Serialize"))]
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

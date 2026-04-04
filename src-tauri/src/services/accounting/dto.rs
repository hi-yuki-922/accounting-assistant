use crate::enums::{AccountingChannel, AccountingType};
use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

/// 添加记账记录 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddAccountingRecordDto {
    pub amount: f64,
    pub record_time: String,
    pub accounting_type: String,
    pub title: String,
    pub channel: String,
    pub remark: Option<String>,
    pub write_off_id: Option<i64>,
    pub book_id: Option<i64>,
    pub order_id: Option<i64>,
}

/// 修改记账记录 DTO
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModifyAccountingRecordDto {
    pub id: i64,
    pub amount: Option<f64>,
    pub record_time: Option<String>,
    pub accounting_type: Option<String>,
    pub title: Option<String>,
    pub remark: Option<Option<String>>,
}

/// DTO 字段类型转换
impl AddAccountingRecordDto {
    /// 将前端传入的字符串/浮点类型转换为内部使用的精确类型
    pub fn to_internal_types(
        &self,
    ) -> Result<(Decimal, NaiveDateTime, AccountingType, AccountingChannel), String> {
        // f64 转 Decimal
        let amount_decimal = Decimal::from_f64_retain(self.amount)
            .ok_or_else(|| "无效的金额".to_string())?;

        // 解析日期字符串
        let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "无效的日期格式，应为 YYYY-MM-DD HH:MM:SS".to_string())?;

        // 解析记账类型
        let parsed_accounting_type = self
            .accounting_type
            .parse::<AccountingType>()
            .map_err(|_| "无效的记账类型".to_string())?;

        // 解析渠道
        let parsed_channel = self
            .channel
            .parse::<AccountingChannel>()
            .map_err(|_| "无效的记账渠道".to_string())?;

        Ok((
            amount_decimal,
            parsed_datetime,
            parsed_accounting_type,
            parsed_channel,
        ))
    }
}

impl ModifyAccountingRecordDto {
    /// 将可选字段转换为内部精确类型
    pub fn to_internal_types(
        &self,
    ) -> Result<
        (
            Option<Decimal>,
            Option<NaiveDateTime>,
            Option<AccountingType>,
        ),
        String,
    > {
        // 可选金额：f64 转 Decimal
        let amount_decimal = if let Some(amount_val) = self.amount {
            Some(
                Decimal::from_f64_retain(amount_val)
                    .ok_or_else(|| "无效的金额".to_string())?,
            )
        } else {
            None
        };

        // 可选日期字符串解析
        let parsed_datetime = if let Some(date_str) = self.record_time.as_ref() {
            Some(
                NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S")
                    .map_err(|_| "无效的日期格式，应为 YYYY-MM-DD HH:MM:SS".to_string())?,
            )
        } else {
            None
        };

        // 可选记账类型解析
        let parsed_accounting_type = if let Some(type_str) = self.accounting_type.as_ref() {
            Some(
                type_str
                    .parse::<AccountingType>()
                    .map_err(|_| "无效的记账类型".to_string())?,
            )
        } else {
            None
        };

        Ok((amount_decimal, parsed_datetime, parsed_accounting_type))
    }
}

/// 批量入账 DTO
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchPostRecordsDto {
    /// 要入账的记录 ID 列表
    pub record_ids: Vec<i64>,
}

/// 创建冲账记录 DTO
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateWriteOffRecordDto {
    /// 被冲账的原始记录 ID
    pub original_record_id: i64,
    /// 冲账金额（支持正负数）
    pub amount: f64,
    /// 渠道（可选，默认继承原始记录渠道）
    pub channel: Option<String>,
    /// 备注
    pub remark: Option<String>,
    /// 记录时间（可选，默认当前时间）
    pub record_time: Option<String>,
}

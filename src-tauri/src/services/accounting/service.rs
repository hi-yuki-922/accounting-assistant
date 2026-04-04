use chrono::{Local, NaiveDateTime};
use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
    TransactionTrait,
};

use crate::entity::accounting_book;
use crate::entity::accounting_record::{self, ActiveModel, Model};
use crate::enums::{AccountingChannel, AccountingRecordState, AccountingType};
use crate::services::accounting_book::DEFAULT_BOOK_ID;

use super::dto::{AddAccountingRecordDto, CreateWriteOffRecordDto, ModifyAccountingRecordDto};

/// 记账服务
#[derive(Debug)]
pub struct AccountingService {
    db: DatabaseConnection,
}

impl AccountingService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建记账记录
    pub async fn create_record(
        &self,
        input: AddAccountingRecordDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        // 转换 DTO 字段为内部类型
        let (amount, record_time, accounting_type, channel) = input.to_internal_types()?;

        // 生成唯一记录 ID
        let id = Model::generate_id(&self.db).await?;

        let book_id = input.book_id.unwrap_or(DEFAULT_BOOK_ID);

        let new_record = ActiveModel {
            id: sea_orm::ActiveValue::Set(id),
            amount: sea_orm::ActiveValue::Set(amount),
            record_time: sea_orm::ActiveValue::Set(record_time),
            accounting_type: sea_orm::ActiveValue::Set(accounting_type),
            title: sea_orm::ActiveValue::Set(input.title),
            channel: sea_orm::ActiveValue::Set(channel),
            remark: sea_orm::ActiveValue::Set(input.remark),
            write_off_id: sea_orm::ActiveValue::Set(input.write_off_id),
            create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
            state: sea_orm::ActiveValue::Set(AccountingRecordState::PendingPosting),
            book_id: sea_orm::ActiveValue::Set(Option::from(book_id)),
            order_id: sea_orm::ActiveValue::Set(input.order_id),
        };

        let inserted_record = new_record.insert(&self.db).await?;

        // 更新对应账本的 record_count
        let book = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(book_id))
            .one(&self.db)
            .await?;

        if let Some(b) = book {
            let mut active_book: accounting_book::ActiveModel = b.into();
            active_book.record_count = Set(active_book.record_count.as_ref() + 1);
            active_book.update(&self.db).await?;
        }

        Ok(inserted_record)
    }

    /// 更新记账记录
    pub async fn update_record(
        &self,
        input: ModifyAccountingRecordDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        // 转换 DTO 字段为内部类型
        let (amount, record_time, accounting_type) = input.to_internal_types()?;

        // 首先获取当前记录以检查其状态
        let record = accounting_record::Entity::find_by_id(input.id)
            .one(&self.db)
            .await?
            .ok_or::<String>("记账记录不存在".into())?;

        // 检查记录是否处于待入账状态
        if record.state != AccountingRecordState::PendingPosting {
            return Err("只有待入账状态的记录可修改".into());
        }

        // 创建活跃模型，仅更新提供的字段
        let mut active_model: ActiveModel = record.into();

        if let Some(new_amount) = amount {
            active_model.amount = sea_orm::ActiveValue::Set(new_amount);
        }

        if let Some(new_record_time) = record_time {
            active_model.record_time = sea_orm::ActiveValue::Set(new_record_time);
        }

        if let Some(new_accounting_type) = accounting_type {
            active_model.accounting_type = sea_orm::ActiveValue::Set(new_accounting_type);
        }

        if let Some(new_title) = input.title {
            active_model.title = sea_orm::ActiveValue::Set(new_title);
        }

        if let Some(new_remark) = input.remark {
            active_model.remark = sea_orm::ActiveValue::Set(new_remark);
        }

        // 更新记录
        let updated_record = active_model.update(&self.db).await?;
        Ok(updated_record)
    }

    /// 过账记账记录
    pub async fn post_record(&self, id: i64) -> Result<Model, Box<dyn std::error::Error>> {
        // 首先获取当前记录
        let record = accounting_record::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or::<String>("记账记录不存在".into())?;

        // 将状态更新为已入账
        let mut active_model: ActiveModel = record.into();
        active_model.state = sea_orm::ActiveValue::Set(AccountingRecordState::Posted);

        // 更新记录
        let updated_record = active_model.update(&self.db).await?;
        Ok(updated_record)
    }

    /// 删除记账记录（仅限待入账且无冲账关联的记录）
    pub async fn delete_record(&self, id: i64) -> Result<(), Box<dyn std::error::Error>> {
        // 查找记录
        let record = accounting_record::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("记录不存在")?;

        // 检查状态：只有待入账记录可删除
        if record.state != AccountingRecordState::PendingPosting {
            return Err("已入账的记录只能冲账，不能删除".into());
        }

        // 检查是否有冲账关联
        let has_write_offs = accounting_record::Entity::find()
            .filter(accounting_record::Column::WriteOffId.eq(id))
            .one(&self.db)
            .await?
            .is_some();

        if has_write_offs {
            return Err("不能删除有冲账关联的记录".into());
        }

        // 删除记录
        accounting_record::Entity::delete_by_id(id)
            .exec(&self.db)
            .await?;

        // 更新账本记录数 -1
        if let Some(book_id) = record.book_id {
            let book = accounting_book::Entity::find_by_id(book_id)
                .one(&self.db)
                .await?;

            if let Some(b) = book {
                let mut active_book: accounting_book::ActiveModel = b.into();
                active_book.record_count = Set(active_book.record_count.as_ref() - 1);
                active_book.update(&self.db).await?;
            }
        }

        Ok(())
    }

    /// 批量入账（预验证 + 事务保证原子性）
    pub async fn batch_post_records(
        &self,
        record_ids: Vec<i64>,
    ) -> Result<Vec<Model>, Box<dyn std::error::Error>> {
        if record_ids.is_empty() {
            return Err("请选择要入账的记录".into());
        }

        // 预验证：查询所有记录
        let records = accounting_record::Entity::find()
            .filter(accounting_record::Column::Id.is_in(record_ids.clone()))
            .all(&self.db)
            .await?;

        // 验证所有记录都存在
        if records.len() != record_ids.len() {
            let found_ids: Vec<i64> = records.iter().map(|r| r.id).collect();
            let missing_ids: Vec<i64> = record_ids
                .iter()
                .filter(|id| !found_ids.contains(id))
                .copied()
                .collect();
            return Err(format!("记录 ID 不存在: {:?}", missing_ids).into());
        }

        // 验证所有记录都是待入账状态
        for record in &records {
            if record.state != AccountingRecordState::PendingPosting {
                return Err(format!("记录 {} 已经是入账状态", record.id).into());
            }
        }

        // 使用事务批量更新
        let txn = self.db.begin().await?;

        for record_id in &record_ids {
            let record = accounting_record::Entity::find_by_id(*record_id)
                .one(&txn)
                .await?
                .ok_or("记录不存在")?;

            let mut active_model: ActiveModel = record.into();
            active_model.state = sea_orm::ActiveValue::Set(AccountingRecordState::Posted);
            active_model.update(&txn).await?;
        }

        txn.commit().await?;

        // 重新查询更新后的记录
        let updated_records = accounting_record::Entity::find()
            .filter(accounting_record::Column::Id.is_in(record_ids))
            .all(&self.db)
            .await?;

        Ok(updated_records)
    }

    /// 创建冲账记录
    pub async fn create_write_off_record(
        &self,
        input: CreateWriteOffRecordDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        // 查找原始记录
        let original_record = accounting_record::Entity::find_by_id(input.original_record_id)
            .one(&self.db)
            .await?
            .ok_or("原始记录不存在")?;

        // 验证原始记录状态为已入账
        if original_record.state != AccountingRecordState::Posted {
            return Err("只能对已入账的记录进行冲账".into());
        }

        // 验证原始记录不是冲账记录
        if original_record.accounting_type == AccountingType::WriteOff {
            return Err("不能对冲账记录进行冲账".into());
        }

        // 转换金额
        let amount =
            Decimal::from_f64_retain(input.amount).ok_or_else(|| "无效的冲账金额".to_string())?;

        // 查询已有的冲账记录总额
        let existing_write_offs = accounting_record::Entity::find()
            .filter(accounting_record::Column::WriteOffId.eq(input.original_record_id))
            .all(&self.db)
            .await?;

        let total_write_off: Decimal = existing_write_offs.iter().map(|r| r.amount).sum();

        // 验证冲账后总和不能小于 0
        let net_after = original_record.amount + total_write_off + amount;
        if net_after < Decimal::ZERO {
            return Err("冲账金额与原始金额的总和不能小于 0".into());
        }

        // 处理时间（默认当前时间）
        let record_time = if let Some(time_str) = input.record_time {
            NaiveDateTime::parse_from_str(&time_str, "%Y-%m-%d %H:%M:%S")
                .map_err(|_| "无效的时间格式".to_string())?
        } else {
            Local::now().naive_local()
        };

        // 处理渠道（默认继承原始记录渠道）
        let channel = if let Some(channel_str) = input.channel {
            channel_str
                .parse::<AccountingChannel>()
                .map_err(|_| "无效的渠道".to_string())?
        } else {
            original_record.channel.clone()
        };

        // 生成唯一 ID
        let id = Model::generate_id(&self.db).await?;

        let book_id = original_record.book_id.unwrap_or(DEFAULT_BOOK_ID);

        let new_record = ActiveModel {
            id: sea_orm::ActiveValue::Set(id),
            amount: sea_orm::ActiveValue::Set(amount),
            record_time: sea_orm::ActiveValue::Set(record_time),
            accounting_type: sea_orm::ActiveValue::Set(AccountingType::WriteOff),
            title: sea_orm::ActiveValue::Set(format!("冲账 - {}", original_record.title)),
            channel: sea_orm::ActiveValue::Set(channel),
            remark: sea_orm::ActiveValue::Set(input.remark),
            write_off_id: sea_orm::ActiveValue::Set(Some(input.original_record_id)),
            create_at: sea_orm::ActiveValue::Set(Local::now().naive_local()),
            state: sea_orm::ActiveValue::Set(AccountingRecordState::Posted),
            book_id: sea_orm::ActiveValue::Set(Some(book_id)),
            order_id: sea_orm::ActiveValue::Set(None),
        };

        let inserted_record = new_record.insert(&self.db).await?;

        // 更新账本记录数 +1
        let book = accounting_book::Entity::find_by_id(book_id)
            .one(&self.db)
            .await?;

        if let Some(b) = book {
            let mut active_book: accounting_book::ActiveModel = b.into();
            active_book.record_count = Set(active_book.record_count.as_ref() + 1);
            active_book.update(&self.db).await?;
        }

        Ok(inserted_record)
    }

    /// 根据订单 ID 查询关联的记账记录
    pub async fn get_record_by_order_id(
        &self,
        order_id: i64,
    ) -> Result<Option<Model>, Box<dyn std::error::Error>> {
        let record = accounting_record::Entity::find()
            .filter(accounting_record::Column::OrderId.eq(order_id))
            .one(&self.db)
            .await?;
        Ok(record)
    }
}

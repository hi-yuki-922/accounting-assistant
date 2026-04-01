use crate::entity::{accounting_book, accounting_record};
use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, ExprTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set, TransactionTrait,
};

pub mod dto;

use self::dto::{
    CreateBookDto, GetBooksPaginatedDto, GetRecordsByBookIdPaginatedDto, PaginatedResponse,
    RecordWithCountDto, RecordWriteOffDetailsDto, UpdateBookDto,
    WriteOffRecordDto,
};

/// 默认账本 ID
pub const DEFAULT_BOOK_ID: i64 = 10000001;

/// 账本服务
#[derive(Debug)]
pub struct AccountingBookService {
    db: DatabaseConnection,
}

impl AccountingBookService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建默认账本（未归类账目）
    pub async fn create_default_book(&self) -> Result<(), Box<dyn std::error::Error>> {
        // 检查默认账本是否已存在
        let existing = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(DEFAULT_BOOK_ID))
            .one(&self.db)
            .await?;

        if existing.is_some() {
            // 默认账本已存在，无需创建
            println!("Default accounting book already exists, skipping creation.");
            return Ok(());
        }

        // 创建默认账本
        let default_create_time =
            chrono::NaiveDateTime::parse_from_str("2000-01-01 00:00:00", "%Y-%m-%d %H:%M:%S")?;

        let new_book = accounting_book::ActiveModel {
            id: Set(DEFAULT_BOOK_ID),
            title: Set("未归类账目".to_string()),
            description: Set(None),
            create_at: Set(default_create_time),
            record_count: Set(0),
            icon: Set(Some("folder".to_string())),
        };

        new_book.insert(&self.db).await?;
        println!("Default accounting book created successfully.");

        Ok(())
    }

    /// 创建账本
    pub async fn create_book(
        &self,
        input: CreateBookDto,
    ) -> Result<accounting_book::Model, Box<dyn std::error::Error>> {
        if input.title.trim().is_empty() {
            return Err("账本标题不能为空".into());
        }

        // 生成账本 ID
        let book_id = accounting_book::Model::generate_id(&self.db).await?;

        let new_book = accounting_book::ActiveModel {
            id: Set(book_id),
            title: Set(input.title),
            description: Set(input.description),
            create_at: Set(chrono::Local::now().naive_local()),
            record_count: Set(0),
            icon: Set(input.icon),
        };

        let book = new_book.insert(&self.db).await?;
        Ok(book)
    }

    /// 查询所有账本
    pub async fn get_books(
        &self,
    ) -> Result<Vec<accounting_book::Model>, Box<dyn std::error::Error>> {
        let books = accounting_book::Entity::find().all(&self.db).await?;
        Ok(books)
    }

    /// 根据ID查询单个账本
    pub async fn get_book_by_id(
        &self,
        id: i64,
    ) -> Result<Option<accounting_book::Model>, Box<dyn std::error::Error>> {
        let book = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(id))
            .one(&self.db)
            .await?;
        Ok(book)
    }

    /// 更新账本信息
    pub async fn update_book(
        &self,
        input: UpdateBookDto,
    ) -> Result<Option<accounting_book::Model>, Box<dyn std::error::Error>> {
        let book = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(input.id))
            .one(&self.db)
            .await?;

        match book {
            Some(book) => {
                let mut active_book: accounting_book::ActiveModel = book.into();

                // 只更新提供的字段
                if let Some(title) = input.title {
                    if title.trim().is_empty() {
                        return Err("账本标题不能为空".into());
                    }
                    active_book.title = Set(title);
                }

                if let Some(description) = input.description {
                    active_book.description = Set(description);
                }

                if let Some(icon) = input.icon {
                    active_book.icon = Set(icon);
                }

                let updated_book = active_book.update(&self.db).await?;
                Ok(Some(updated_book))
            }
            None => Ok(None),
        }
    }

    /// 删除账本（将关联记录迁移到默认账本）
    pub async fn delete_book(&self, id: i64) -> Result<bool, Box<dyn std::error::Error>> {
        // 禁止删除默认账本
        if id == DEFAULT_BOOK_ID {
            return Err("默认账本不能删除".into());
        }

        let txn = self.db.begin().await?;

        // 查找要删除的账本
        let book = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(id))
            .one(&txn)
            .await?;

        if book.is_none() {
            return Ok(false);
        }

        let _book = book.unwrap();

        // 将该账本的所有记录迁移到默认账本
        let update = accounting_record::ActiveModel {
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };

        let update_result = accounting_record::Entity::update_many()
            .filter(accounting_record::Column::BookId.eq(id))
            .set(update)
            .exec(&txn)
            .await?;

        // 更新默认账本的 record_count
        if update_result.rows_affected > 0 {
            let mut default_book = accounting_book::ActiveModel::from(
                accounting_book::Entity::find()
                    .filter(accounting_book::Column::Id.eq(DEFAULT_BOOK_ID))
                    .one(&txn)
                    .await?
                    .ok_or("默认账本不存在")?,
            );
            default_book.record_count =
                Set(default_book.record_count.as_ref() + update_result.rows_affected as i32);
            default_book.update(&txn).await?;
        }

        // 删除账本
        accounting_book::Entity::delete_many()
            .filter(accounting_book::Column::Id.eq(id))
            .exec(&txn)
            .await?;

        txn.commit().await?;
        Ok(true)
    }

    /// 查询指定账本下的所有记录
    pub async fn get_records_by_book_id(
        &self,
        book_id: i64,
    ) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
        // 查询指定账本的记录
        let records = accounting_record::Entity::find()
            .filter(accounting_record::Column::BookId.eq(book_id))
            .all(&self.db)
            .await?;

        Ok(records)
    }

    /// 查询未归类账目（包括 NULL 和默认账本的记录）
    pub async fn get_uncategorized_records(
        &self,
    ) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
        let records = accounting_record::Entity::find()
            .filter(
                accounting_record::Column::BookId
                    .is_null()
                    .or(accounting_record::Column::BookId.eq(DEFAULT_BOOK_ID)),
            )
            .all(&self.db)
            .await?;

        Ok(records)
    }

    /// 分页查询账本列表
    pub async fn get_books_paginated(
        &self,
        input: GetBooksPaginatedDto,
    ) -> Result<PaginatedResponse<accounting_book::Model>, Box<dyn std::error::Error>> {
        // 纠正无效页码，确保 page >= 1
        let page = if input.page < 1 { 1 } else { input.page };
        let page_size = input.page_size;

        // 获取总数量
        let total = accounting_book::Entity::find().count(&self.db).await?;

        // 计算总页数
        let total_pages = if total == 0 {
            0
        } else {
            total.div_ceil(page_size)
        };

        // 如果页码超出范围，返回空数据
        if page > total_pages && total > 0 {
            return Ok(PaginatedResponse {
                data: vec![],
                total,
                page,
                page_size,
                total_pages,
            });
        }

        // 构建分页查询
        let paginator = accounting_book::Entity::find()
            .order_by_desc(accounting_book::Column::CreateAt)
            .paginate(&self.db, page_size);

        // 获取当前页数据（注意：fetch_page 使用 0-based 索引）
        let data = paginator.fetch_page(page - 1).await?;

        Ok(PaginatedResponse {
            data,
            total,
            page,
            page_size,
            total_pages,
        })
    }

    /// 分页查询指定账本下的记账记录
    pub async fn get_records_by_book_id_paginated(
        &self,
        input: GetRecordsByBookIdPaginatedDto,
    ) -> Result<PaginatedResponse<RecordWithCountDto>, Box<dyn std::error::Error>> {
        // 验证账本是否存在
        let book_exists = accounting_book::Entity::find()
            .filter(accounting_book::Column::Id.eq(input.book_id))
            .one(&self.db)
            .await?;

        if book_exists.is_none() {
            return Err("账本不存在".into());
        }

        // 纠正无效页码，确保 page >= 1
        let page = if input.page < 1 { 1 } else { input.page };
        let page_size = input.page_size;

        // 构建基础查询条件
        let mut query = if input.book_id == DEFAULT_BOOK_ID {
            // 如果是查询未归类账目，还需要包含 book_id 为 NULL 的记录
            accounting_record::Entity::find().filter(
                accounting_record::Column::BookId
                    .is_null()
                    .or(accounting_record::Column::BookId.eq(DEFAULT_BOOK_ID)),
            )
        } else {
            accounting_record::Entity::find()
                .filter(accounting_record::Column::BookId.eq(input.book_id))
        };

        // 2.1 固定过滤条件：只查询 write_off_id 为 NULL 的记录
        query = query.filter(accounting_record::Column::WriteOffId.is_null());

        // 2.2 时间范围过滤
        if let Some(start_time) = input.start_time {
            query = query.filter(accounting_record::Column::RecordTime.gte(start_time));
        }
        if let Some(end_time) = input.end_time {
            query = query.filter(accounting_record::Column::RecordTime.lte(end_time));
        }

        // 2.3 记账类型过滤
        if let Some(accounting_type) = input.accounting_type {
            query = query.filter(accounting_record::Column::AccountingType.eq(accounting_type));
        }

        // 2.4 记账渠道过滤
        if let Some(channel) = input.channel {
            query = query.filter(accounting_record::Column::Channel.eq(channel));
        }

        // 2.5 记录状态过滤
        if let Some(state) = input.state {
            query = query.filter(accounting_record::Column::State.eq(state));
        }

        // 获取总数量（使用相同的查询条件）
        let total = query.clone().count(&self.db).await?;

        // 计算总页数
        let total_pages = if total == 0 {
            0
        } else {
            total.div_ceil(page_size)
        };

        // 如果页码超出范围，返回空数据
        if page > total_pages && total > 0 {
            return Ok(PaginatedResponse {
                data: vec![],
                total,
                page,
                page_size,
                total_pages,
            });
        }

        // 构建分页查询，按记录时间倒序排列
        let paginator = query
            .order_by_desc(accounting_record::Column::RecordTime)
            .paginate(&self.db, page_size);

        // 获取当前页数据（注意：fetch_page 使用 0-based 索引）
        let records = paginator.fetch_page(page - 1).await?;

        // 2.6 批量查询关联记录数量和冲账金额合计
        let record_ids: Vec<i64> = records.iter().map(|r| r.id).collect();
        let aggregates = self.get_write_off_aggregates(&record_ids).await?;

        // 2.7 将关联记录数量和净金额注入到每条记录的返回数据中
        let data: Vec<RecordWithCountDto> = records
            .into_iter()
            .map(|record| {
                let (related_count, write_off_sum) = aggregates
                    .get(&record.id)
                    .copied()
                    .unwrap_or((0, Decimal::ZERO));
                let original_amount = record.amount;
                let net_amount = original_amount + write_off_sum;
                RecordWithCountDto {
                    record,
                    related_count,
                    original_amount,
                    net_amount,
                }
            })
            .collect();

        // 2.8 更新函数返回类型，使用 PaginatedResponse<RecordWithCountDto>
        Ok(PaginatedResponse {
            data,
            total,
            page,
            page_size,
            total_pages,
        })
    }

    /// 批量查询记录的关联数量和冲账金额合计
    async fn get_write_off_aggregates(
        &self,
        record_ids: &[i64],
    ) -> Result<std::collections::HashMap<i64, (i64, Decimal)>, Box<dyn std::error::Error>> {
        if record_ids.is_empty() {
            return Ok(std::collections::HashMap::new());
        }

        // 查询所有冲账记录
        let write_offs = accounting_record::Entity::find()
            .filter(accounting_record::Column::WriteOffId.is_in(record_ids.to_vec()))
            .all(&self.db)
            .await?;

        // 按原始记录 ID 分组，计算关联数量和金额合计
        let mut result = std::collections::HashMap::new();
        for wo in &write_offs {
            if let Some(parent_id) = wo.write_off_id {
                let entry = result.entry(parent_id).or_insert((0i64, Decimal::ZERO));
                entry.0 += 1;
                entry.1 += wo.amount;
            }
        }

        // 为没有冲账记录的 ID 添加默认值
        for id in record_ids {
            if !result.contains_key(id) {
                result.insert(*id, (0, Decimal::ZERO));
            }
        }

        Ok(result)
    }

    /// 获取记录的冲账详情（HoverCard 按需加载）
    pub async fn get_record_write_off_details(
        &self,
        record_id: i64,
    ) -> Result<RecordWriteOffDetailsDto, Box<dyn std::error::Error>> {
        // 查找原始记录
        let record = accounting_record::Entity::find_by_id(record_id)
            .one(&self.db)
            .await?
            .ok_or("记录不存在")?;

        let original_amount = record.amount;

        // 查询所有冲账记录，按创建时间倒序
        let write_off_records = accounting_record::Entity::find()
            .filter(accounting_record::Column::WriteOffId.eq(record_id))
            .order_by_desc(accounting_record::Column::CreateAt)
            .all(&self.db)
            .await?;

        // 转换为 DTO
        let write_off_dtos: Vec<WriteOffRecordDto> = write_off_records
            .into_iter()
            .map(|r| WriteOffRecordDto {
                id: r.id,
                amount: r.amount,
                record_time: r.record_time,
                remark: r.remark,
                channel: r.channel,
            })
            .collect();

        Ok(RecordWriteOffDetailsDto {
            original_amount,
            write_off_records: write_off_dtos,
        })
    }

    /// 根据记录 ID 查询冲账关联记录
    ///
    /// # 参数
    /// * `record_id` - 记账记录 ID
    ///
    /// # 返回
    /// 所有 `write_off_id` 等于给定记录 ID 的记账记录，按创建时间倒序排列
    pub async fn get_write_off_records_by_id(
        &self,
        record_id: i64,
    ) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
        // 3.2 实现根据记录 ID 查询关联记录的逻辑（通过 write_off_id 字段）
        // 3.3 实现查询结果按创建时间倒序排列
        let records = accounting_record::Entity::find()
            .filter(accounting_record::Column::WriteOffId.eq(record_id))
            .order_by_desc(accounting_record::Column::CreateAt)
            .all(&self.db)
            .await?;

        Ok(records)
    }
}

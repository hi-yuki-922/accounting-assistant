use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, ExprTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect, Set, TransactionTrait};
use crate::entity::{accounting_book, accounting_record};

pub mod dto;

use self::dto::{CreateBookDto, UpdateBookTitleDto, GetBooksPaginatedDto, GetRecordsByBookIdPaginatedDto, PaginatedResponse, RecordWithCountDto};

/// 默认账本 ID
pub const DEFAULT_BOOK_ID: i64 = 10000001;

/// 创建账本
pub async fn create_book(
    db: &DatabaseConnection,
    input: CreateBookDto,
) -> Result<accounting_book::Model, Box<dyn std::error::Error>> {
    if input.title.trim().is_empty() {
        return Err("账本标题不能为空".into());
    }

    // 生成账本 ID
    let book_id = accounting_book::Model::generate_id(db).await?;

    let new_book = accounting_book::ActiveModel {
        id: Set(book_id),
        title: Set(input.title),
        create_at: Set(chrono::Local::now().naive_local()),
    };

    let book = new_book.insert(db).await?;
    Ok(book)
}

/// 查询所有账本
pub async fn get_books(
    db: &DatabaseConnection,
) -> Result<Vec<accounting_book::Model>, Box<dyn std::error::Error>> {
    let books = accounting_book::Entity::find()
        .all(db)
        .await?;
    Ok(books)
}

/// 根据ID查询单个账本
pub async fn get_book_by_id(
    db: &DatabaseConnection,
    id: i64,
) -> Result<Option<accounting_book::Model>, Box<dyn std::error::Error>> {
    let book = accounting_book::Entity::find()
        .filter(accounting_book::Column::Id.eq(id))
        .one(db)
        .await?;
    Ok(book)
}

/// 修改账本标题
pub async fn update_book_title(
    db: &DatabaseConnection,
    input: UpdateBookTitleDto,
) -> Result<Option<accounting_book::Model>, Box<dyn std::error::Error>> {
    if input.new_title.trim().is_empty() {
        return Err("账本标题不能为空".into());
    }

    let book = accounting_book::Entity::find()
        .filter(accounting_book::Column::Id.eq(input.id))
        .one(db)
        .await?;

    match book {
        Some(book) => {
            let mut active_book: accounting_book::ActiveModel = book.into();
            active_book.title = Set(input.new_title);

            let updated_book = active_book.update(db).await?;
            Ok(Some(updated_book))
        }
        None => Ok(None),
    }
}

/// 删除账本（将关联记录迁移到默认账本）
pub async fn delete_book(
    db: &DatabaseConnection,
    id: i64,
) -> Result<bool, Box<dyn std::error::Error>> {
    // 禁止删除默认账本
    if id == DEFAULT_BOOK_ID {
        return Err("默认账本不能删除".into());
    }

    let txn = db.begin().await?;

    // 查找要删除的账本
    let book = accounting_book::Entity::find()
        .filter(accounting_book::Column::Id.eq(id))
        .one(&txn)
        .await?;

    if book.is_none() {
        return Ok(false);
    }

    // 将该账本的所有记录迁移到默认账本
    let update = accounting_record::ActiveModel {
        book_id: Set(Some(DEFAULT_BOOK_ID)),
        ..Default::default()
    };

    accounting_record::Entity::update_many()
        .filter(accounting_record::Column::BookId.eq(id))
        .set(update)
        .exec(&txn)
        .await?;

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
    db: &DatabaseConnection,
    book_id: i64,
) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
    // 查询指定账本的记录
    let records = accounting_record::Entity::find()
        .filter(accounting_record::Column::BookId.eq(book_id))
        .all(db)
        .await?;

    Ok(records)
}

/// 查询未归类账目（包括 NULL 和默认账本的记录）
pub async fn get_uncategorized_records(
    db: &DatabaseConnection,
) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
    let records = accounting_record::Entity::find()
        .filter(
            accounting_record::Column::BookId.is_null()
                .or(accounting_record::Column::BookId.eq(DEFAULT_BOOK_ID))
        )
        .all(db)
        .await?;

    Ok(records)
}

/// 分页查询账本列表
pub async fn get_books_paginated(
    db: &DatabaseConnection,
    input: GetBooksPaginatedDto,
) -> Result<PaginatedResponse<accounting_book::Model>, Box<dyn std::error::Error>> {
    // 纠正无效页码，确保 page >= 1
    let page = if input.page < 1 { 1 } else { input.page };
    let page_size = input.page_size;

    // 获取总数量
    let total = accounting_book::Entity::find()
        .count(db)
        .await?;

    // 计算总页数
    let total_pages = if total == 0 { 0 } else { (total + page_size - 1) / page_size };

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
        .paginate(db, page_size);

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
    db: &DatabaseConnection,
    input: GetRecordsByBookIdPaginatedDto,
) -> Result<PaginatedResponse<RecordWithCountDto>, Box<dyn std::error::Error>> {
    // 验证账本是否存在
    let book_exists = accounting_book::Entity::find()
        .filter(accounting_book::Column::Id.eq(input.book_id))
        .one(db)
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
        accounting_record::Entity::find()
            .filter(
                accounting_record::Column::BookId.is_null()
                    .or(accounting_record::Column::BookId.eq(DEFAULT_BOOK_ID))
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
    let total = query.clone().count(db).await?;

    // 计算总页数
    let total_pages = if total == 0 { 0 } else { (total + page_size - 1) / page_size };

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
        .paginate(db, page_size);

    // 获取当前页数据（注意：fetch_page 使用 0-based 索引）
    let records = paginator.fetch_page(page - 1).await?;

    // 2.6 批量查询关联记录数量
    let record_ids: Vec<i64> = records.iter().map(|r| r.id).collect();
    let related_counts = get_related_records_count(db, &record_ids).await?;

    // 2.7 将关联记录数量注入到每条记录的返回数据中
    let data: Vec<RecordWithCountDto> = records
        .into_iter()
        .map(|record| {
            let related_count = *related_counts.get(&record.id).unwrap_or(&0);
            RecordWithCountDto {
                record,
                related_count,
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

/// 批量查询记录的关联记录数量
async fn get_related_records_count(
    db: &DatabaseConnection,
    record_ids: &[i64],
) -> Result<std::collections::HashMap<i64, i64>, Box<dyn std::error::Error>> {
    if record_ids.is_empty() {
        return Ok(std::collections::HashMap::new());
    }

    // 批量查询每条记录的关联数量
    let counts: Vec<(i64, i64)> = accounting_record::Entity::find()
        .select_only()
        .column_as(accounting_record::Column::WriteOffId, "record_id")
        .column_as(accounting_record::Column::Id.count(), "count")
        .filter(accounting_record::Column::WriteOffId.is_in(record_ids.to_vec()))
        .group_by(accounting_record::Column::WriteOffId)
        .into_tuple::<(i64, i64)>()
        .all(db)
        .await?;

    // 转换为 HashMap
    let mut result = std::collections::HashMap::new();
    for (record_id, count) in counts {
        result.insert(record_id, count);
    }

    // 为没有关联记录的 ID 添加 0
    for id in record_ids {
        if !result.contains_key(id) {
            result.insert(*id, 0);
        }
    }

    Ok(result)
}

/// 根据记录 ID 查询冲账关联记录
///
/// # 参数
/// * `db` - 数据库连接
/// * `record_id` - 记账记录 ID
///
/// # 返回
/// 所有 `write_off_id` 等于给定记录 ID 的记账记录，按创建时间倒序排列
pub async fn get_write_off_records_by_id(
    db: &DatabaseConnection,
    record_id: i64,
) -> Result<Vec<accounting_record::Model>, Box<dyn std::error::Error>> {
    // 3.2 实现根据记录 ID 查询关联记录的逻辑（通过 write_off_id 字段）
    // 3.3 实现查询结果按创建时间倒序排列
    let records = accounting_record::Entity::find()
        .filter(accounting_record::Column::WriteOffId.eq(record_id))
        .order_by_desc(accounting_record::Column::CreateAt)
        .all(db)
        .await?;

    Ok(records)
}

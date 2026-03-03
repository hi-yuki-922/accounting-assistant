use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, ExprTrait, PaginatorTrait, QueryFilter, QueryOrder, Set, TransactionTrait};
use crate::entity::{accounting_book, accounting_record};

pub mod dto;

use self::dto::{CreateBookDto, UpdateBookTitleDto, GetBooksPaginatedDto, GetRecordsByBookIdPaginatedDto, PaginatedResponse};

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
) -> Result<PaginatedResponse<accounting_record::Model>, Box<dyn std::error::Error>> {
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

    // 构建查询条件
    let query = if input.book_id == DEFAULT_BOOK_ID {
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
    let data = paginator.fetch_page(page - 1).await?;

    Ok(PaginatedResponse {
        data,
        total,
        page,
        page_size,
        total_pages,
    })
}

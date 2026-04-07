use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, Set};

use super::dto::{CreateCategoryDto, UpdateCategoryDto};
use crate::entity::accounting_book;
use crate::entity::category::{self, ActiveModel as CategoryActiveModel};
use crate::services::accounting_book::DEFAULT_BOOK_ID;

/// 默认品类名称
pub const DEFAULT_CATEGORY_NAME: &str = "未分类";

/// 品类服务
#[derive(Debug)]
pub struct CategoryService {
    db: DatabaseConnection,
}

impl CategoryService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建品类
    pub async fn create_category(
        &self,
        input: CreateCategoryDto,
    ) -> Result<category::Model, Box<dyn std::error::Error>> {
        // 验证名称非空
        if input.name.trim().is_empty() {
            return Err("品类名称不能为空".into());
        }

        // 验证名称唯一
        let existing = category::Entity::find()
            .filter(category::Column::Name.eq(&input.name))
            .one(&self.db)
            .await?;
        if existing.is_some() {
            return Err(format!("品类名称\"{}\"已存在", input.name).into());
        }

        // 验证销售账本存在
        let sell_book = accounting_book::Entity::find_by_id(input.sell_book_id)
            .one(&self.db)
            .await?;
        if sell_book.is_none() {
            return Err("销售账本不存在".into());
        }

        // 验证进货账本存在
        let purchase_book = accounting_book::Entity::find_by_id(input.purchase_book_id)
            .one(&self.db)
            .await?;
        if purchase_book.is_none() {
            return Err("进货账本不存在".into());
        }

        // 生成 ID 并创建
        let id = category::Model::generate_id(&self.db).await?;

        let active_model = CategoryActiveModel {
            id: Set(id),
            name: Set(input.name),
            sell_book_id: Set(input.sell_book_id),
            purchase_book_id: Set(input.purchase_book_id),
            remark: Set(input.remark),
            ..Default::default()
        };

        let category = active_model.insert(&self.db).await?;
        Ok(category)
    }

    /// 更新品类
    pub async fn update_category(
        &self,
        input: UpdateCategoryDto,
    ) -> Result<category::Model, Box<dyn std::error::Error>> {
        let category = category::Entity::find_by_id(input.id)
            .one(&self.db)
            .await?
            .ok_or("品类不存在")?;

        let mut active_model: CategoryActiveModel = category.into();

        // 更新名称
        if let Some(name) = input.name {
            let trimmed = name.trim();
            if trimmed.is_empty() {
                return Err("品类名称不能为空".into());
            }

            // "未分类"品类名称不可修改
            if active_model.name.as_ref() == DEFAULT_CATEGORY_NAME {
                return Err(format!("\"{}\"品类名称不可修改", DEFAULT_CATEGORY_NAME).into());
            }

            // 名称唯一性校验
            let existing = category::Entity::find()
                .filter(category::Column::Name.eq(trimmed))
                .filter(category::Column::Id.ne(input.id))
                .one(&self.db)
                .await?;
            if existing.is_some() {
                return Err(format!("品类名称\"{}\"已存在", trimmed).into());
            }

            active_model.name = Set(trimmed.to_string());
        }

        // 更新销售账本
        if let Some(sell_book_id) = input.sell_book_id {
            let book = accounting_book::Entity::find_by_id(sell_book_id)
                .one(&self.db)
                .await?;
            if book.is_none() {
                return Err("销售账本不存在".into());
            }
            active_model.sell_book_id = Set(sell_book_id);
        }

        // 更新进货账本
        if let Some(purchase_book_id) = input.purchase_book_id {
            let book = accounting_book::Entity::find_by_id(purchase_book_id)
                .one(&self.db)
                .await?;
            if book.is_none() {
                return Err("进货账本不存在".into());
            }
            active_model.purchase_book_id = Set(purchase_book_id);
        }

        // 更新备注
        if let Some(remark) = input.remark {
            active_model.remark = Set(remark);
        }

        let updated = active_model.update(&self.db).await?;
        Ok(updated)
    }

    /// 删除品类
    pub async fn delete_category(
        &self,
        id: i64,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let category = category::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("品类不存在")?;

        // "未分类"品类不可删除
        if category.name == DEFAULT_CATEGORY_NAME {
            return Err(format!("\"{}\"品类不可删除", DEFAULT_CATEGORY_NAME).into());
        }

        // 检查是否有关联商品
        let product_count = crate::entity::product::Entity::find()
            .filter(crate::entity::product::Column::CategoryId.eq(id))
            .count(&self.db)
            .await?;

        if product_count > 0 {
            return Err(format!("该品类下存在 {} 个关联商品，无法删除", product_count).into());
        }

        category::Entity::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    /// 查询所有品类（"未分类"排首位，其余按创建时间升序）
    pub async fn get_all_categories(
        &self,
    ) -> Result<Vec<category::Model>, Box<dyn std::error::Error>> {
        let all = category::Entity::find()
            .order_by_asc(category::Column::CreateAt)
            .all(&self.db)
            .await?;

        // "未分类"排首位，其余按创建时间升序
        let mut uncategorized = Vec::new();
        let mut others = Vec::new();

        for cat in all {
            if cat.name == DEFAULT_CATEGORY_NAME {
                uncategorized.push(cat);
            } else {
                others.push(cat);
            }
        }

        uncategorized.extend(others);
        Ok(uncategorized)
    }

    /// 根据 ID 查询品类
    pub async fn get_category_by_id(
        &self,
        id: i64,
    ) -> Result<category::Model, Box<dyn std::error::Error>> {
        category::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("品类不存在".into())
    }

    /// 创建默认品类（系统启动时调用）
    pub async fn create_default_category(&self) -> Result<(), Box<dyn std::error::Error>> {
        // 检查默认品类是否已存在
        let existing = category::Entity::find()
            .filter(category::Column::Name.eq(DEFAULT_CATEGORY_NAME))
            .one(&self.db)
            .await?;

        if existing.is_some() {
            return Ok(());
        }

        let id = category::Model::generate_id(&self.db).await?;

        let active_model = CategoryActiveModel {
            id: Set(id),
            name: Set(DEFAULT_CATEGORY_NAME.to_string()),
            sell_book_id: Set(DEFAULT_BOOK_ID),
            purchase_book_id: Set(DEFAULT_BOOK_ID),
            remark: Set(None),
            ..Default::default()
        };

        active_model.insert(&self.db).await?;
        Ok(())
    }
}

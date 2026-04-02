pub mod dto;

use sea_orm::{ActiveModelBehavior, ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder};
use crate::entity::product::{self, ActiveModel, Model};
use self::dto::{CreateProductDto, UpdateProductDto};

/// 商品管理服务
#[derive(Debug)]
pub struct ProductService {
    db: DatabaseConnection,
}

impl ProductService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建商品
    pub async fn create_product(
        &self,
        input: CreateProductDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        let id = Model::generate_id(&self.db).await?;

        let new_product = ActiveModel {
            id: sea_orm::ActiveValue::Set(id),
            name: sea_orm::ActiveValue::Set(input.name),
            category: sea_orm::ActiveValue::Set(input.category),
            unit: sea_orm::ActiveValue::Set(input.unit),
            default_sell_price: sea_orm::ActiveValue::Set(input.default_sell_price),
            default_purchase_price: sea_orm::ActiveValue::Set(input.default_purchase_price),
            sku: sea_orm::ActiveValue::Set(input.sku),
            keywords: sea_orm::ActiveValue::Set(input.keywords),
            remark: sea_orm::ActiveValue::Set(input.remark),
            ..ActiveModel::new()
        };

        let inserted = new_product.insert(&self.db).await?;
        Ok(inserted)
    }

    /// 修改商品（仅更新传入的非空字段）
    pub async fn update_product(
        &self,
        input: UpdateProductDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        let record = product::Entity::find_by_id(input.id)
            .one(&self.db)
            .await?
            .ok_or("商品不存在")?;

        let mut active_model: ActiveModel = record.into();

        if let Some(name) = input.name {
            active_model.name = sea_orm::ActiveValue::Set(name);
        }

        if let Some(category) = input.category {
            active_model.category = sea_orm::ActiveValue::Set(category);
        }

        if let Some(unit) = input.unit {
            active_model.unit = sea_orm::ActiveValue::Set(unit);
        }

        if let Some(default_sell_price) = input.default_sell_price {
            active_model.default_sell_price = sea_orm::ActiveValue::Set(default_sell_price);
        }

        if let Some(default_purchase_price) = input.default_purchase_price {
            active_model.default_purchase_price = sea_orm::ActiveValue::Set(default_purchase_price);
        }

        if let Some(sku) = input.sku {
            active_model.sku = sea_orm::ActiveValue::Set(sku);
        }

        if let Some(keywords) = input.keywords {
            active_model.keywords = sea_orm::ActiveValue::Set(keywords);
        }

        if let Some(remark) = input.remark {
            active_model.remark = sea_orm::ActiveValue::Set(remark);
        }

        let updated = active_model.update(&self.db).await?;
        Ok(updated)
    }

    /// 删除商品
    pub async fn delete_product(&self, id: i64) -> Result<(), Box<dyn std::error::Error>> {
        let record = product::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("商品不存在")?;

        product::Entity::delete_by_id(record.id).exec(&self.db).await?;
        Ok(())
    }

    /// 获取全部商品（按创建时间倒序）
    pub async fn get_all_products(&self) -> Result<Vec<Model>, Box<dyn std::error::Error>> {
        let products = product::Entity::find()
            .order_by_desc(product::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(products)
    }

    /// 按 ID 查询商品
    pub async fn get_product_by_id(&self, id: i64) -> Result<Model, Box<dyn std::error::Error>> {
        let record = product::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("商品不存在")?;
        Ok(record)
    }

    /// 按商品名称、分类、SKU 或关键词模糊搜索
    pub async fn search_products(&self, keyword: String) -> Result<Vec<Model>, Box<dyn std::error::Error>> {
        let pattern = format!("%{}%", keyword);
        let products = product::Entity::find()
            .filter(
                Condition::any()
                    .add(product::Column::Name.like(&pattern))
                    .add(product::Column::Category.like(&pattern))
                    .add(product::Column::Sku.like(&pattern))
                    .add(product::Column::Keywords.like(&pattern))
            )
            .order_by_desc(product::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(products)
    }
}

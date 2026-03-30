pub mod dto;

use sea_orm::{ActiveModelBehavior, ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder};
use crate::entity::customer::{self, ActiveModel, Model};
use crate::enums::CustomerCategory;
use self::dto::{CreateCustomerDto, UpdateCustomerDto};

/// 客户管理服务
#[derive(Debug)]
pub struct CustomerService {
    db: DatabaseConnection,
}

impl CustomerService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建客户
    pub async fn create_customer(
        &self,
        input: CreateCustomerDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        let category = input.category.parse::<CustomerCategory>()
            .map_err(|_| "无效的客户分类".to_string())?;

        let id = Model::generate_id(&self.db).await?;

        let new_customer = ActiveModel {
            id: sea_orm::ActiveValue::Set(id),
            name: sea_orm::ActiveValue::Set(input.name),
            category: sea_orm::ActiveValue::Set(category),
            phone: sea_orm::ActiveValue::Set(input.phone),
            wechat: sea_orm::ActiveValue::Set(input.wechat),
            address: sea_orm::ActiveValue::Set(input.address),
            bank_account: sea_orm::ActiveValue::Set(input.bank_account),
            remark: sea_orm::ActiveValue::Set(input.remark),
            ..ActiveModel::new()
        };

        let inserted = new_customer.insert(&self.db).await?;
        Ok(inserted)
    }

    /// 修改客户（仅更新传入的非空字段）
    pub async fn update_customer(
        &self,
        input: UpdateCustomerDto,
    ) -> Result<Model, Box<dyn std::error::Error>> {
        let record = customer::Entity::find_by_id(input.id)
            .one(&self.db)
            .await?
            .ok_or("客户不存在")?;

        let mut active_model: ActiveModel = record.into();

        if let Some(name) = input.name {
            active_model.name = sea_orm::ActiveValue::Set(name);
        }

        if let Some(category_str) = input.category {
            let category = category_str.parse::<CustomerCategory>()
                .map_err(|_| "无效的客户分类".to_string())?;
            active_model.category = sea_orm::ActiveValue::Set(category);
        }

        if let Some(phone) = input.phone {
            active_model.phone = sea_orm::ActiveValue::Set(phone);
        }

        if let Some(wechat) = input.wechat {
            active_model.wechat = sea_orm::ActiveValue::Set(wechat);
        }

        if let Some(address) = input.address {
            active_model.address = sea_orm::ActiveValue::Set(address);
        }

        if let Some(bank_account) = input.bank_account {
            active_model.bank_account = sea_orm::ActiveValue::Set(bank_account);
        }

        if let Some(remark) = input.remark {
            active_model.remark = sea_orm::ActiveValue::Set(remark);
        }

        let updated = active_model.update(&self.db).await?;
        Ok(updated)
    }

    /// 删除客户
    pub async fn delete_customer(&self, id: i64) -> Result<(), Box<dyn std::error::Error>> {
        let record = customer::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("客户不存在")?;

        customer::Entity::delete_by_id(record.id).exec(&self.db).await?;
        Ok(())
    }

    /// 获取全部客户（按创建时间倒序）
    pub async fn get_all_customers(&self) -> Result<Vec<Model>, Box<dyn std::error::Error>> {
        let customers = customer::Entity::find()
            .order_by_desc(customer::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(customers)
    }

    /// 按 ID 查询客户
    pub async fn get_customer_by_id(&self, id: i64) -> Result<Model, Box<dyn std::error::Error>> {
        let record = customer::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("客户不存在")?;
        Ok(record)
    }

    /// 按姓名或电话号码模糊搜索客户
    pub async fn search_customers(&self, keyword: String) -> Result<Vec<Model>, Box<dyn std::error::Error>> {
        let pattern = format!("%{}%", keyword);
        let customers = customer::Entity::find()
            .filter(
                Condition::any()
                    .add(customer::Column::Name.like(&pattern))
                    .add(customer::Column::Phone.like(&pattern))
            )
            .order_by_desc(customer::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(customers)
    }
}

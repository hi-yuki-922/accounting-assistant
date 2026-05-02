use accounting_assistant_lib::entity::category;
use accounting_assistant_lib::services::accounting_book::DEFAULT_BOOK_ID;
use accounting_assistant_lib::services::category::DEFAULT_CATEGORY_NAME;
use accounting_assistant_lib::services::category::dto::{CreateCategoryDto, UpdateCategoryDto};
use accounting_assistant_lib::services::CategoryService;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use serial_test::serial;

use crate::context::run_in_transaction;

/// 辅助函数：创建默认品类 DTO（使用默认账本 ID）
fn make_create_dto(name: &str) -> CreateCategoryDto {
    CreateCategoryDto {
        name: name.to_string(),
        sell_book_id: DEFAULT_BOOK_ID,
        purchase_book_id: DEFAULT_BOOK_ID,
        remark: None,
    }
}

// ==================== create_category 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_category_success() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto = CreateCategoryDto {
            name: "水果".to_string(),
            sell_book_id: DEFAULT_BOOK_ID,
            purchase_book_id: DEFAULT_BOOK_ID,
            remark: Some("水果类商品".to_string()),
        };

        let cat = service.create_category(dto).await?;

        assert!(cat.id > 0);
        assert_eq!(cat.name, "水果");
        assert_eq!(cat.sell_book_id, DEFAULT_BOOK_ID);
        assert_eq!(cat.purchase_book_id, DEFAULT_BOOK_ID);
        assert_eq!(cat.remark, Some("水果类商品".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_category_empty_name() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto = CreateCategoryDto {
            name: "   ".to_string(),
            sell_book_id: DEFAULT_BOOK_ID,
            purchase_book_id: DEFAULT_BOOK_ID,
            remark: None,
        };

        let result = service.create_category(dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "品类名称不能为空");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_category_duplicate_name() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto1 = make_create_dto("水果");
        service.create_category(dto1).await?;

        let dto2 = make_create_dto("水果");
        let result = service.create_category(dto2).await;

        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("已存在"));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_category_sell_book_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto = CreateCategoryDto {
            name: "测试".to_string(),
            sell_book_id: 999999,
            purchase_book_id: DEFAULT_BOOK_ID,
            remark: None,
        };

        let result = service.create_category(dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "销售账本不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_category_purchase_book_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto = CreateCategoryDto {
            name: "测试".to_string(),
            sell_book_id: DEFAULT_BOOK_ID,
            purchase_book_id: 999999,
            remark: None,
        };

        let result = service.create_category(dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "进货账本不存在");

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== update_category 测试 ====================

#[serial]
#[tokio::test]
async fn test_update_category_name_success() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("原名")).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: Some("新名".to_string()),
            sell_book_id: None,
            purchase_book_id: None,
            remark: None,
        };

        let updated = service.update_category(update_dto).await?;
        assert_eq!(updated.name, "新名");
        assert_eq!(updated.id, cat.id);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_remark() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("测试")).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: None,
            sell_book_id: None,
            purchase_book_id: None,
            remark: Some(Some("新增备注".to_string())),
        };

        let updated = service.update_category(update_dto).await?;
        assert_eq!(updated.remark, Some("新增备注".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_remove_remark() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let dto = CreateCategoryDto {
            name: "有备注".to_string(),
            sell_book_id: DEFAULT_BOOK_ID,
            purchase_book_id: DEFAULT_BOOK_ID,
            remark: Some("原始备注".to_string()),
        };
        let cat = service.create_category(dto).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: None,
            sell_book_id: None,
            purchase_book_id: None,
            remark: Some(None),
        };

        let updated = service.update_category(update_dto).await?;
        assert_eq!(updated.remark, None);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_empty_name() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("测试")).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: Some("   ".to_string()),
            sell_book_id: None,
            purchase_book_id: None,
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "品类名称不能为空");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_default_name_not_modifiable() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        // 创建默认品类
        service.create_default_category().await?;

        // 查找默认品类
        let cats = service.get_all_categories().await?;
        let default_cat = cats.into_iter().find(|c| c.name == DEFAULT_CATEGORY_NAME).unwrap();

        // 尝试修改默认品类名称
        let update_dto = UpdateCategoryDto {
            id: default_cat.id,
            name: Some("尝试改名".to_string()),
            sell_book_id: None,
            purchase_book_id: None,
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("品类名称不可修改"));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_duplicate_name() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        service.create_category(make_create_dto("水果")).await?;
        let cat2 = service.create_category(make_create_dto("蔬菜")).await?;

        // 尝试将 "蔬菜" 改为 "水果"（已存在）
        let update_dto = UpdateCategoryDto {
            id: cat2.id,
            name: Some("水果".to_string()),
            sell_book_id: None,
            purchase_book_id: None,
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("已存在"));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let update_dto = UpdateCategoryDto {
            id: 999999,
            name: Some("不存在".to_string()),
            sell_book_id: None,
            purchase_book_id: None,
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_sell_book_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("测试")).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: None,
            sell_book_id: Some(999999),
            purchase_book_id: None,
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "销售账本不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_category_purchase_book_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("测试")).await?;

        let update_dto = UpdateCategoryDto {
            id: cat.id,
            name: None,
            sell_book_id: None,
            purchase_book_id: Some(999999),
            remark: None,
        };

        let result = service.update_category(update_dto).await;
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "进货账本不存在");

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== delete_category 测试 ====================

#[serial]
#[tokio::test]
async fn test_delete_category_success() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("待删除")).await?;
        service.delete_category(cat.id).await?;

        let found = category::Entity::find_by_id(cat.id).one(&db).await?;
        assert!(found.is_none());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_category_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let result = service.delete_category(999999).await;
        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_category_default_not_deletable() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        service.create_default_category().await?;
        let cats = service.get_all_categories().await?;
        let default_cat = cats.into_iter().find(|c| c.name == DEFAULT_CATEGORY_NAME).unwrap();

        let result = service.delete_category(default_cat.id).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("不可删除"));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_category_with_linked_products() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cat = service.create_category(make_create_dto("水果")).await?;

        // 手动插入一个关联商品
        use accounting_assistant_lib::entity::product;
        let product_active = product::ActiveModel {
            id: sea_orm::ActiveValue::NotSet,
            name: sea_orm::Set("苹果".to_string()),
            category_id: sea_orm::Set(Some(cat.id)),
            category: sea_orm::Set(Some("水果".to_string())),
            unit: sea_orm::Set("斤".to_string()),
            default_sell_price: sea_orm::Set(None),
            default_purchase_price: sea_orm::Set(None),
            sku: sea_orm::Set(None),
            keywords: sea_orm::Set(None),
            remark: sea_orm::Set(None),
            ..Default::default()
        };
        product_active.insert(&db).await?;

        let result = service.delete_category(cat.id).await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("关联商品"));

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== get_all_categories 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_all_categories_empty() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let cats = service.get_all_categories().await?;
        assert!(cats.is_empty());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_all_categories_default_first() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        service.create_default_category().await?;
        service.create_category(make_create_dto("水果")).await?;
        service.create_category(make_create_dto("蔬菜")).await?;

        let cats = service.get_all_categories().await?;
        assert_eq!(cats.len(), 3);
        // "未分类" 排首位
        assert_eq!(cats[0].name, DEFAULT_CATEGORY_NAME);

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== get_category_by_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_category_by_id_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let created = service.create_category(make_create_dto("水果")).await?;
        let found = service.get_category_by_id(created.id).await?;

        assert_eq!(found.id, created.id);
        assert_eq!(found.name, "水果");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_category_by_id_not_found() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        let result = service.get_category_by_id(999999).await;
        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== create_default_category 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_default_category_first_time() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        service.create_default_category().await?;

        let cats = service.get_all_categories().await?;
        assert_eq!(cats.len(), 1);
        assert_eq!(cats[0].name, DEFAULT_CATEGORY_NAME);
        assert_eq!(cats[0].sell_book_id, DEFAULT_BOOK_ID);
        assert_eq!(cats[0].purchase_book_id, DEFAULT_BOOK_ID);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_default_category_idempotent() {
    run_in_transaction(|db| async move {
        let service = CategoryService::new(db.clone());

        service.create_default_category().await?;
        service.create_default_category().await?;

        let cats = service.get_all_categories().await?;
        let default_count = cats.iter().filter(|c| c.name == DEFAULT_CATEGORY_NAME).count();
        assert_eq!(default_count, 1, "默认品类不应重复创建");

        Ok(())
    })
    .await
    .unwrap();
}

use accounting_assistant_lib::entity::product;
use accounting_assistant_lib::services::product::dto::{CreateProductDto, UpdateProductDto};
use accounting_assistant_lib::services::ProductService;
use rust_decimal::Decimal;
use sea_orm::EntityTrait;
use serial_test::serial;

use crate::context::run_in_transaction;

// ==================== create_product 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_product_success() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto = CreateProductDto {
            name: "苹果".to_string(),
            category_id: None,
            category: Some("水果".to_string()),
            unit: "斤".to_string(),
            default_sell_price: Some(Decimal::new(800, 2)),
            default_purchase_price: Some(Decimal::new(500, 2)),
            sku: Some("APL001".to_string()),
            keywords: Some("红富士;冰糖心".to_string()),
            remark: Some("当季水果".to_string()),
        };

        let product = service.create_product(dto).await?;

        assert!(product.id > 0);
        assert_eq!(product.name, "苹果");
        assert_eq!(product.category, Some("水果".to_string()));
        assert_eq!(product.unit, "斤");
        assert_eq!(product.default_sell_price, Some(Decimal::new(800, 2)));
        assert_eq!(product.default_purchase_price, Some(Decimal::new(500, 2)));
        assert_eq!(product.sku, Some("APL001".to_string()));
        assert_eq!(product.keywords, Some("红富士;冰糖心".to_string()));
        assert_eq!(product.remark, Some("当季水果".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_product_minimal_fields() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto = CreateProductDto {
            name: "测试商品".to_string(),
            category_id: None,
            category: None,
            unit: "个".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };

        let product = service.create_product(dto).await?;

        assert_eq!(product.name, "测试商品");
        assert_eq!(product.unit, "个");
        assert_eq!(product.category, None);
        assert_eq!(product.default_sell_price, None);

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== update_product 测试 ====================

#[serial]
#[tokio::test]
async fn test_update_product_success() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let create_dto = CreateProductDto {
            name: "原始商品".to_string(),
            category_id: None,
            category: Some("分类A".to_string()),
            unit: "个".to_string(),
            default_sell_price: Some(Decimal::new(1000, 2)),
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        let product = service.create_product(create_dto).await?;

        let update_dto = UpdateProductDto {
            id: product.id,
            name: Some("更新商品".to_string()),
            category_id: None,
            category: Some(Some("分类B".to_string())),
            unit: None,
            default_sell_price: Some(Some(Decimal::new(1200, 2))),
            default_purchase_price: None,
            sku: Some(Some("SKU001".to_string())),
            keywords: None,
            remark: None,
        };

        let updated = service.update_product(update_dto).await?;

        assert_eq!(updated.name, "更新商品");
        assert_eq!(updated.category, Some("分类B".to_string()));
        assert_eq!(updated.unit, "个"); // 未修改
        assert_eq!(updated.default_sell_price, Some(Decimal::new(1200, 2)));
        assert_eq!(updated.sku, Some("SKU001".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_product_not_found() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let update_dto = UpdateProductDto {
            id: 999999,
            name: Some("不存在".to_string()),
            category_id: None,
            category: None,
            unit: None,
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };

        let result = service.update_product(update_dto).await;

        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== delete_product 测试 ====================

#[serial]
#[tokio::test]
async fn test_delete_product_success() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let create_dto = CreateProductDto {
            name: "待删除".to_string(),
            category_id: None,
            category: None,
            unit: "个".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        let product = service.create_product(create_dto).await?;

        service.delete_product(product.id).await?;

        let found = product::Entity::find_by_id(product.id).one(&db).await?;
        assert!(found.is_none());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_product_not_found() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let result = service.delete_product(999999).await;

        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== get_all_products 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_all_products_empty() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let products = service.get_all_products().await?;

        assert!(products.is_empty());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_all_products_ordered_by_create_at_desc() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        for i in 1..=3 {
            let dto = CreateProductDto {
                name: format!("商品{}", i),
                category_id: None,
                category: None,
                unit: "个".to_string(),
                default_sell_price: None,
                default_purchase_price: None,
                sku: None,
                keywords: None,
                remark: None,
            };
            service.create_product(dto).await?;
        }

        let products = service.get_all_products().await?;

        assert_eq!(products.len(), 3);
        // 按创建时间倒序：最后创建的排在最前
        assert_eq!(products[0].name, "商品3");
        assert_eq!(products[2].name, "商品1");

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== get_product_by_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_product_by_id_found() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let create_dto = CreateProductDto {
            name: "查询测试".to_string(),
            category_id: None,
            category: Some("测试分类".to_string()),
            unit: "箱".to_string(),
            default_sell_price: Some(Decimal::new(2500, 2)),
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        let created = service.create_product(create_dto).await?;

        let found = service.get_product_by_id(created.id).await?;

        assert_eq!(found.id, created.id);
        assert_eq!(found.name, "查询测试");
        assert_eq!(found.unit, "箱");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_product_by_id_not_found() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let result = service.get_product_by_id(999999).await;

        assert!(result.is_err());

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== search_products 测试 ====================

#[serial]
#[tokio::test]
async fn test_search_products_by_name() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto1 = CreateProductDto {
            name: "红富士苹果".to_string(),
            category_id: None,
            category: Some("水果".to_string()),
            unit: "斤".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        service.create_product(dto1).await?;

        let dto2 = CreateProductDto {
            name: "香蕉".to_string(),
            category_id: None,
            category: Some("水果".to_string()),
            unit: "斤".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        service.create_product(dto2).await?;

        let results = service.search_products("苹果".to_string()).await?;

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "红富士苹果");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_search_products_by_category() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto1 = CreateProductDto {
            name: "苹果".to_string(),
            category_id: None,
            category: Some("水果".to_string()),
            unit: "斤".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        service.create_product(dto1).await?;

        let dto2 = CreateProductDto {
            name: "白菜".to_string(),
            category_id: None,
            category: Some("蔬菜".to_string()),
            unit: "斤".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        service.create_product(dto2).await?;

        let results = service.search_products("水果".to_string()).await?;

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "苹果");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_search_products_by_keywords() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto = CreateProductDto {
            name: "鲍鱼".to_string(),
            category_id: None,
            category: Some("海鲜".to_string()),
            unit: "个".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: Some("六头;六粒;35#".to_string()),
            remark: None,
        };
        service.create_product(dto).await?;

        let results = service.search_products("六头".to_string()).await?;

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "鲍鱼");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_search_products_no_match() {
    run_in_transaction(|db| async move {
        let service = ProductService::new(db.clone());

        let dto = CreateProductDto {
            name: "苹果".to_string(),
            category_id: None,
            category: Some("水果".to_string()),
            unit: "斤".to_string(),
            default_sell_price: None,
            default_purchase_price: None,
            sku: None,
            keywords: None,
            remark: None,
        };
        service.create_product(dto).await?;

        let results = service.search_products("不存在的商品".to_string()).await?;

        assert!(results.is_empty());

        Ok(())
    })
    .await
    .unwrap();
}

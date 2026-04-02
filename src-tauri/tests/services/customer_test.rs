use accounting_assistant_lib::entity::customer;
use accounting_assistant_lib::services::customer::dto::{CreateCustomerDto, UpdateCustomerDto};
use accounting_assistant_lib::services::CustomerService;
use chrono::Datelike;
use sea_orm::EntityTrait;
use serial_test::serial;

use crate::context::run_in_transaction;

// ==================== create_customer 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_customer_success() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let dto = CreateCustomerDto {
            name: "张三".to_string(),
            category: "Retailer".to_string(),
            phone: "13800138000".to_string(),
            wechat: Some("zhangsan_wx".to_string()),
            address: Some("北京市朝阳区".to_string()),
            bank_account: None,
            remark: None,
        };

        let customer = service.create_customer(dto).await?;

        assert!(customer.id > 0);
        assert_eq!(customer.name, "张三");
        assert_eq!(customer.phone, "13800138000");
        assert_eq!(customer.wechat, Some("zhangsan_wx".to_string()));
        assert_eq!(customer.address, Some("北京市朝阳区".to_string()));
        assert!(customer.create_at.year() > 0);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_customer_minimal_fields() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let dto = CreateCustomerDto {
            name: "李四".to_string(),
            category: "Supplier".to_string(),
            phone: "13900139000".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };

        let customer = service.create_customer(dto).await?;

        assert_eq!(customer.name, "李四");
        assert_eq!(customer.wechat, None);
        assert_eq!(customer.address, None);

        Ok(())
    }).await.unwrap();
}

// ==================== update_customer 测试 ====================

#[serial]
#[tokio::test]
async fn test_update_customer_name() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let create_dto = CreateCustomerDto {
            name: "原始名".to_string(),
            category: "Retailer".to_string(),
            phone: "13800138000".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        let customer = service.create_customer(create_dto).await?;

        let update_dto = UpdateCustomerDto {
            id: customer.id,
            name: Some("新名称".to_string()),
            category: None,
            phone: None,
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };

        let updated = service.update_customer(update_dto).await?;

        assert_eq!(updated.name, "新名称");
        assert_eq!(updated.phone, "13800138000");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_customer_not_found() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let update_dto = UpdateCustomerDto {
            id: 999999,
            name: Some("不存在".to_string()),
            category: None,
            phone: None,
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };

        let result = service.update_customer(update_dto).await;

        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== delete_customer 测试 ====================

#[serial]
#[tokio::test]
async fn test_delete_customer_success() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let create_dto = CreateCustomerDto {
            name: "待删除".to_string(),
            category: "Retailer".to_string(),
            phone: "13800138000".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        let customer = service.create_customer(create_dto).await?;

        service.delete_customer(customer.id).await?;

        let found = customer::Entity::find_by_id(customer.id)
            .one(&db)
            .await?;
        assert!(found.is_none());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_customer_not_found() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let result = service.delete_customer(999999).await;

        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== get_all_customers 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_all_customers_empty() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let customers = service.get_all_customers().await?;

        assert!(customers.is_empty());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_all_customers_multiple() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        // 创建多个客户
        for i in 1..=3 {
            let dto = CreateCustomerDto {
                name: format!("客户{}", i),
                category: "Retailer".to_string(),
                phone: format!("1380013800{}", i),
                wechat: None,
                address: None,
                bank_account: None,
                remark: None,
            };
            service.create_customer(dto).await?;
        }

        let customers = service.get_all_customers().await?;

        assert_eq!(customers.len(), 3);
        // 按创建时间倒序，最后创建的排在最前
        assert_eq!(customers[0].name, "客户3");
        assert_eq!(customers[2].name, "客户1");

        Ok(())
    }).await.unwrap();
}

// ==================== get_customer_by_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_customer_by_id_found() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let create_dto = CreateCustomerDto {
            name: "查询测试".to_string(),
            category: "Supplier".to_string(),
            phone: "13800138000".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: Some("测试备注".to_string()),
        };
        let created = service.create_customer(create_dto).await?;

        let found = service.get_customer_by_id(created.id).await?;

        assert_eq!(found.id, created.id);
        assert_eq!(found.name, "查询测试");
        assert_eq!(found.remark, Some("测试备注".to_string()));

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_customer_by_id_not_found() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let result = service.get_customer_by_id(999999).await;

        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== search_customers 测试 ====================

#[serial]
#[tokio::test]
async fn test_search_customers_by_name() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let dto1 = CreateCustomerDto {
            name: "苹果供应商".to_string(),
            category: "Supplier".to_string(),
            phone: "13800138001".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        service.create_customer(dto1).await?;

        let dto2 = CreateCustomerDto {
            name: "香蕉供应商".to_string(),
            category: "Supplier".to_string(),
            phone: "13800138002".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        service.create_customer(dto2).await?;

        let results = service.search_customers("苹果".to_string()).await?;

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "苹果供应商");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_search_customers_by_phone() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let dto = CreateCustomerDto {
            name: "测试客户".to_string(),
            category: "Retailer".to_string(),
            phone: "13912345678".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        service.create_customer(dto).await?;

        let results = service.search_customers("1391234".to_string()).await?;

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].phone, "13912345678");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_search_customers_no_match() {
    run_in_transaction(|db| async move {
        let service = CustomerService::new(db.clone());

        let dto = CreateCustomerDto {
            name: "测试客户".to_string(),
            category: "Retailer".to_string(),
            phone: "13800138000".to_string(),
            wechat: None,
            address: None,
            bank_account: None,
            remark: None,
        };
        service.create_customer(dto).await?;

        let results = service.search_customers("不存在的名字".to_string()).await?;

        assert!(results.is_empty());

        Ok(())
    }).await.unwrap();
}

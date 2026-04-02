use accounting_assistant_lib::entity::order_item;
use accounting_assistant_lib::entity::accounting_record;
use accounting_assistant_lib::entity::accounting_book;
use accounting_assistant_lib::enums::{AccountingType, AccountingChannel, AccountingRecordState, OrderStatus, OrderType};
use accounting_assistant_lib::services::order::dto::{CreateOrderDto, CreateOrderItemDto, SettleOrderDto, UpdateOrderDto, QueryOrdersDto};
use accounting_assistant_lib::services::OrderService;
use accounting_assistant_lib::services::accounting_book::DEFAULT_BOOK_ID;
use rust_decimal::Decimal;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serial_test::serial;

use crate::context::run_in_transaction;

/// 辅助函数：构造一条商品明细 DTO
fn make_item(product_id: i64, name: &str, quantity: Decimal, unit: &str, unit_price: Decimal) -> CreateOrderItemDto {
    CreateOrderItemDto {
        product_id,
        product_name: name.to_string(),
        quantity,
        unit: unit.to_string(),
        unit_price,
        remark: None,
    }
}

// ==================== create_order 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_order_success() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
                make_item(2, "香蕉", Decimal::new(5, 0), "斤", Decimal::new(500, 2)),
            ],
            remark: Some("测试订单".to_string()),
            actual_amount: None,
        };

        let order = service.create_order(dto).await?;

        assert!(order.id > 0);
        assert!(!order.order_no.is_empty());
        assert_eq!(order.order_type, OrderType::Sales);
        assert_eq!(order.customer_id, None);
        assert_eq!(order.status, OrderStatus::Pending);
        assert_eq!(order.channel, AccountingChannel::Unknown);
        assert_eq!(order.accounting_record_id, None);
        assert_eq!(order.remark, Some("测试订单".to_string()));
        // total = 10*8.00 + 5*5.00 = 80 + 25 = 105
        assert_eq!(order.total_amount, Decimal::new(10500, 2));
        assert_eq!(order.actual_amount, Decimal::new(10500, 2));

        // 验证明细已创建
        let items = order_item::Entity::find()
            .filter(order_item::Column::OrderId.eq(order.id))
            .all(&db)
            .await?;
        assert_eq!(items.len(), 2);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_order_empty_items_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![],
            remark: None,
            actual_amount: None,
        };

        let result = service.create_order(dto).await;

        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_order_with_custom_actual_amount() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let dto = CreateOrderDto {
            order_type: "Purchase".to_string(),
            customer_id: Some(100),
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: Some(Decimal::new(7500, 2)), // 抹零
        };

        let order = service.create_order(dto).await?;

        assert_eq!(order.order_type, OrderType::Purchase);
        assert_eq!(order.customer_id, Some(100));
        assert_eq!(order.total_amount, Decimal::new(8000, 2));
        assert_eq!(order.actual_amount, Decimal::new(7500, 2));

        Ok(())
    }).await.unwrap();
}

// ==================== update_order 测试 ====================

#[serial]
#[tokio::test]
async fn test_update_order_pending_success() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 创建订单
        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: Some("原始备注".to_string()),
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;
        let original_total = order.total_amount;

        // 更新订单（替换明细 + 修改备注）
        let update_dto = UpdateOrderDto {
            order_id: order.id,
            items: Some(vec![
                make_item(1, "苹果", Decimal::new(20, 0), "斤", Decimal::new(800, 2)),
                make_item(2, "香蕉", Decimal::new(10, 0), "斤", Decimal::new(500, 2)),
            ]),
            remark: Some("更新备注".to_string()),
        };

        let updated = service.update_order(update_dto).await?;

        assert_eq!(updated.remark, Some("更新备注".to_string()));
        // 新 total = 20*8.00 + 10*5.00 = 160 + 50 = 210
        assert_eq!(updated.total_amount, Decimal::new(21000, 2));
        assert_ne!(updated.total_amount, original_total);

        // 验证明细已替换
        let items = order_item::Entity::find()
            .filter(order_item::Column::OrderId.eq(order.id))
            .all(&db)
            .await?;
        assert_eq!(items.len(), 2);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_order_settled_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 创建并结账
        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };
        service.settle_order(settle_dto).await?;

        // 尝试编辑已结账订单
        let update_dto = UpdateOrderDto {
            order_id: order.id,
            items: Some(vec![
                make_item(1, "苹果", Decimal::new(5, 0), "斤", Decimal::new(800, 2)),
            ]),
            remark: None,
        };

        let result = service.update_order(update_dto).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_order_cancelled_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        service.cancel_order(order.id).await?;

        let update_dto = UpdateOrderDto {
            order_id: order.id,
            items: None,
            remark: Some("尝试修改".to_string()),
        };

        let result = service.update_order(update_dto).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_order_empty_items_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let update_dto = UpdateOrderDto {
            order_id: order.id,
            items: Some(vec![]),
            remark: None,
        };

        let result = service.update_order(update_dto).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== settle_order 测试 ====================

#[serial]
#[tokio::test]
async fn test_settle_order_sales_creates_income_record() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        // 获取默认账本初始记录数
        let book_before = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&db)
            .await?
            .expect("默认账本应存在");
        let count_before = book_before.record_count;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };

        let settled = service.settle_order(settle_dto).await?;

        // 验证订单状态
        assert_eq!(settled.status, OrderStatus::Settled);
        assert_eq!(settled.channel, AccountingChannel::BankCard);
        assert!(settled.accounting_record_id.is_some());
        assert!(settled.settled_at.is_some());

        // 验证生成了 Income 类型的记账记录
        let record_id = settled.accounting_record_id.unwrap();
        let record = accounting_record::Entity::find_by_id(record_id)
            .one(&db)
            .await?
            .expect("记账记录应存在");

        assert_eq!(record.accounting_type, AccountingType::Income);
        assert_eq!(record.title, format!("销售订单-{}", settled.order_no));
        assert_eq!(record.amount, Decimal::new(8000, 2));
        assert_eq!(record.channel, AccountingChannel::BankCard);
        assert_eq!(record.state, AccountingRecordState::Posted);
        assert_eq!(record.order_id, Some(order.id));

        // 验证账本 record_count +1
        let book_after = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&db)
            .await?
            .expect("默认账本应存在");
        assert_eq!(book_after.record_count, count_before + 1);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_settle_order_purchase_creates_expenditure_record() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Purchase".to_string(),
            customer_id: Some(100),
            items: vec![
                make_item(1, "苹果", Decimal::new(20, 0), "斤", Decimal::new(600, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "Wechat".to_string(),
            actual_amount: None,
        };

        let settled = service.settle_order(settle_dto).await?;

        let record = accounting_record::Entity::find_by_id(settled.accounting_record_id.unwrap())
            .one(&db)
            .await?
            .expect("记账记录应存在");

        assert_eq!(record.accounting_type, AccountingType::Expenditure);
        assert_eq!(record.title, format!("采购订单-{}", settled.order_no));
        assert_eq!(record.channel, AccountingChannel::Wechat);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_settle_order_with_custom_actual_amount() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "Cash".to_string(),
            actual_amount: Some(Decimal::new(7500, 2)),
        };

        let settled = service.settle_order(settle_dto).await?;

        assert_eq!(settled.actual_amount, Decimal::new(7500, 2));

        let record = accounting_record::Entity::find_by_id(settled.accounting_record_id.unwrap())
            .one(&db)
            .await?
            .expect("记账记录应存在");
        assert_eq!(record.amount, Decimal::new(7500, 2));

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_settle_order_already_settled_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };
        service.settle_order(settle_dto).await?;

        // 重复结账
        let settle_dto2 = SettleOrderDto {
            order_id: order.id,
            channel: "Cash".to_string(),
            actual_amount: None,
        };
        let result = service.settle_order(settle_dto2).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_settle_order_cancelled_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;
        service.cancel_order(order.id).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };

        let result = service.settle_order(settle_dto).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== cancel_order 测试 ====================

#[serial]
#[tokio::test]
async fn test_cancel_order_success() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let cancelled = service.cancel_order(order.id).await?;

        assert_eq!(cancelled.status, OrderStatus::Cancelled);
        assert_eq!(cancelled.id, order.id);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_cancel_order_settled_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
            ],
            remark: None,
            actual_amount: None,
        };
        let order = service.create_order(create_dto).await?;

        let settle_dto = SettleOrderDto {
            order_id: order.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };
        service.settle_order(settle_dto).await?;

        let result = service.cancel_order(order.id).await;
        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_cancel_order_not_found_error() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let result = service.cancel_order(999999).await;

        assert!(result.is_err());

        Ok(())
    }).await.unwrap();
}

// ==================== get_all_orders 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_all_orders_empty() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let orders = service.get_all_orders().await?;

        assert!(orders.is_empty());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_all_orders_ordered_by_create_at_desc() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        for i in 1..=3 {
            let dto = CreateOrderDto {
                order_type: "Sales".to_string(),
                customer_id: None,
                items: vec![
                    make_item(i, &format!("商品{}", i), Decimal::new(1, 0), "个", Decimal::new(100, 2)),
                ],
                remark: None,
                actual_amount: None,
            };
            service.create_order(dto).await?;
        }

        let orders = service.get_all_orders().await?;

        assert_eq!(orders.len(), 3);
        // 按创建时间倒序：最后创建的排在最前
        assert!(orders[0].create_at >= orders[1].create_at);
        assert!(orders[1].create_at >= orders[2].create_at);

        Ok(())
    }).await.unwrap();
}

// ==================== get_order_by_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_order_by_id_with_items() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let create_dto = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![
                make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2)),
                make_item(2, "香蕉", Decimal::new(5, 0), "斤", Decimal::new(500, 2)),
            ],
            remark: Some("含明细".to_string()),
            actual_amount: None,
        };
        let created = service.create_order(create_dto).await?;

        let result = service.get_order_by_id(created.id).await?;

        assert!(result.is_some());
        let (order, items) = result.unwrap();

        assert_eq!(order.id, created.id);
        assert_eq!(order.remark, Some("含明细".to_string()));
        assert_eq!(items.len(), 2);

        // 验证明细内容
        let apple_item = items.iter().find(|i| i.product_name == "苹果").expect("应有苹果明细");
        assert_eq!(apple_item.quantity, Decimal::new(10, 0));
        assert_eq!(apple_item.unit_price, Decimal::new(800, 2));
        assert_eq!(apple_item.subtotal, Decimal::new(8000, 2));

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_order_by_id_not_found() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let result = service.get_order_by_id(999999).await?;

        assert!(result.is_none());

        Ok(())
    }).await.unwrap();
}

// ==================== get_orders_by_customer_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_orders_by_customer_id() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 客户 100 的订单
        let dto1 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: Some(100),
            items: vec![make_item(1, "苹果", Decimal::new(1, 0), "斤", Decimal::new(800, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto1).await?;

        // 客户 200 的订单
        let dto2 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: Some(200),
            items: vec![make_item(2, "香蕉", Decimal::new(1, 0), "斤", Decimal::new(500, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto2).await?;

        // 散客订单
        let dto3 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(3, "橙子", Decimal::new(1, 0), "斤", Decimal::new(600, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto3).await?;

        let customer_100_orders = service.get_orders_by_customer_id(100).await?;
        assert_eq!(customer_100_orders.len(), 1);
        assert_eq!(customer_100_orders[0].customer_id, Some(100));

        let customer_200_orders = service.get_orders_by_customer_id(200).await?;
        assert_eq!(customer_200_orders.len(), 1);

        let none_orders = service.get_orders_by_customer_id(999).await?;
        assert!(none_orders.is_empty());

        Ok(())
    }).await.unwrap();
}

// ==================== get_orders_by_status 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_orders_by_status() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 创建两个订单，一个结账一个取消
        let dto1 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(1, "苹果", Decimal::new(1, 0), "斤", Decimal::new(800, 2))],
            remark: None,
            actual_amount: None,
        };
        let order1 = service.create_order(dto1).await?;

        let dto2 = CreateOrderDto {
            order_type: "Purchase".to_string(),
            customer_id: None,
            items: vec![make_item(2, "香蕉", Decimal::new(1, 0), "斤", Decimal::new(500, 2))],
            remark: None,
            actual_amount: None,
        };
        let order2 = service.create_order(dto2).await?;

        // 结账 order1
        let settle_dto = SettleOrderDto {
            order_id: order1.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };
        service.settle_order(settle_dto).await?;

        // 取消 order2
        service.cancel_order(order2.id).await?;

        let settled = service.get_orders_by_status("Settled".to_string()).await?;
        assert_eq!(settled.len(), 1);
        assert_eq!(settled[0].status, OrderStatus::Settled);

        let cancelled = service.get_orders_by_status("Cancelled".to_string()).await?;
        assert_eq!(cancelled.len(), 1);
        assert_eq!(cancelled[0].status, OrderStatus::Cancelled);

        let pending = service.get_orders_by_status("Pending".to_string()).await?;
        assert!(pending.is_empty());

        Ok(())
    }).await.unwrap();
}

// ==================== query_orders 测试 ====================

#[serial]
#[tokio::test]
async fn test_query_orders_pagination() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 创建 5 个订单
        for i in 1..=5 {
            let dto = CreateOrderDto {
                order_type: "Sales".to_string(),
                customer_id: None,
                items: vec![make_item(i, &format!("商品{}", i), Decimal::new(1, 0), "个", Decimal::new(100, 2))],
                remark: None,
                actual_amount: None,
            };
            service.create_order(dto).await?;
        }

        // 第 1 页，每页 2 条
        let query = QueryOrdersDto {
            page: Some(1),
            page_size: Some(2),
            start_time: None,
            end_time: None,
            status: None,
            min_amount: None,
            max_amount: None,
            channel: None,
            order_type: None,
        };
        let (orders, total) = service.query_orders(query).await?;

        assert_eq!(total, 5);
        assert_eq!(orders.len(), 2);

        // 第 3 页，超出范围
        let query_page3 = QueryOrdersDto {
            page: Some(3),
            page_size: Some(2),
            start_time: None,
            end_time: None,
            status: None,
            min_amount: None,
            max_amount: None,
            channel: None,
            order_type: None,
        };
        let (orders_p3, total_p3) = service.query_orders(query_page3).await?;

        assert_eq!(total_p3, 5);
        assert_eq!(orders_p3.len(), 1);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_orders_filter_by_status() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let dto1 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(1, "苹果", Decimal::new(1, 0), "斤", Decimal::new(800, 2))],
            remark: None,
            actual_amount: None,
        };
        let order1 = service.create_order(dto1).await?;

        let settle_dto = SettleOrderDto {
            order_id: order1.id,
            channel: "BankCard".to_string(),
            actual_amount: None,
        };
        service.settle_order(settle_dto).await?;

        // 创建一个 Pending 订单
        let dto2 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(2, "香蕉", Decimal::new(1, 0), "斤", Decimal::new(500, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto2).await?;

        let query = QueryOrdersDto {
            page: None,
            page_size: None,
            start_time: None,
            end_time: None,
            status: Some("Settled".to_string()),
            min_amount: None,
            max_amount: None,
            channel: None,
            order_type: None,
        };
        let (orders, total) = service.query_orders(query).await?;

        assert_eq!(total, 1);
        assert_eq!(orders.len(), 1);
        assert_eq!(orders[0].status, OrderStatus::Settled);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_orders_filter_by_order_type() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let dto1 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(1, "苹果", Decimal::new(1, 0), "斤", Decimal::new(800, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto1).await?;

        let dto2 = CreateOrderDto {
            order_type: "Purchase".to_string(),
            customer_id: None,
            items: vec![make_item(2, "香蕉", Decimal::new(1, 0), "斤", Decimal::new(500, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto2).await?;

        let query = QueryOrdersDto {
            page: None,
            page_size: None,
            start_time: None,
            end_time: None,
            status: None,
            min_amount: None,
            max_amount: None,
            channel: None,
            order_type: Some("Sales".to_string()),
        };
        let (orders, total) = service.query_orders(query).await?;

        assert_eq!(total, 1);
        assert_eq!(orders[0].order_type, OrderType::Sales);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_orders_filter_by_amount_range() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        // 金额 80.00
        let dto1 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(1, "苹果", Decimal::new(10, 0), "斤", Decimal::new(800, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto1).await?;

        // 金额 50.00
        let dto2 = CreateOrderDto {
            order_type: "Sales".to_string(),
            customer_id: None,
            items: vec![make_item(2, "香蕉", Decimal::new(10, 0), "斤", Decimal::new(500, 2))],
            remark: None,
            actual_amount: None,
        };
        service.create_order(dto2).await?;

        let query = QueryOrdersDto {
            page: None,
            page_size: None,
            start_time: None,
            end_time: None,
            status: None,
            min_amount: Some(Decimal::new(6000, 2)), // 60.00
            max_amount: Some(Decimal::new(10000, 2)), // 100.00
            channel: None,
            order_type: None,
        };
        let (orders, total) = service.query_orders(query).await?;

        assert_eq!(total, 1);
        assert_eq!(orders[0].actual_amount, Decimal::new(8000, 2));

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_orders_no_results() {
    run_in_transaction(|db| async move {
        let service = OrderService::new(db.clone());

        let query = QueryOrdersDto {
            page: Some(1),
            page_size: Some(10),
            start_time: None,
            end_time: None,
            status: None,
            min_amount: None,
            max_amount: None,
            channel: None,
            order_type: None,
        };
        let (orders, total) = service.query_orders(query).await?;

        assert_eq!(total, 0);
        assert!(orders.is_empty());

        Ok(())
    }).await.unwrap();
}

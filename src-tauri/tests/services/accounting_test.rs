use accounting_assistant_lib::entity::accounting_book;
use accounting_assistant_lib::entity::accounting_record::{self, Entity};
use accounting_assistant_lib::enums::{AccountingChannel, AccountingRecordState, AccountingType};
use accounting_assistant_lib::services::accounting::dto::{
    AddAccountingRecordDto, CreateWriteOffRecordDto, ModifyAccountingRecordDto,
};
use accounting_assistant_lib::services::accounting_book::DEFAULT_BOOK_ID;
use accounting_assistant_lib::services::AccountingService;
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serial_test::serial;

use crate::context::run_in_transaction;

#[serial]
#[tokio::test]
async fn test_add_record_income() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let dto = AddAccountingRecordDto {
            amount: 100.50,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "工资收入".to_string(),
            channel: "BankCard".to_string(),
            remark: Some("1月工资".to_string()),
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(dto).await?;

        assert!(record.id > 0);
        assert_eq!(record.title, "工资收入");
        assert_eq!(record.amount, Decimal::new(10050, 2)); // 100.50
        assert_eq!(record.accounting_type, AccountingType::Income);
        assert_eq!(record.channel, AccountingChannel::BankCard);
        assert_eq!(record.state, AccountingRecordState::PendingPosting);
        assert_eq!(record.remark, Some("1月工资".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_add_record_expenditure() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let dto = AddAccountingRecordDto {
            amount: 25.80,
            record_time: "2024-01-02 14:30:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "午餐".to_string(),
            channel: "Wechat".to_string(),
            remark: Some("公司楼下餐厅".to_string()),
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::Expenditure);
        assert_eq!(record.channel, AccountingChannel::Wechat);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_add_record_investment_income() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-03 10:00:00".to_string(),
            accounting_type: "InvestmentIncome".to_string(),
            title: "股票分红".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::InvestmentIncome);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_add_record_investment_loss() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-04 10:00:00".to_string(),
            accounting_type: "InvestmentLoss".to_string(),
            title: "股票亏损".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::InvestmentLoss);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_add_record_with_book_id() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let dto = AddAccountingRecordDto {
            amount: 50.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: Some(DEFAULT_BOOK_ID),
            order_id: None,
        };

        let record = service.create_record(dto).await?;

        assert_eq!(record.book_id, Some(DEFAULT_BOOK_ID));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_add_record_with_write_off_id() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 先创建主记录
        let master_dto = AddAccountingRecordDto {
            amount: 200.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "预付款".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let master_record = service.create_record(master_dto).await?;

        // 创建冲账记录
        let write_off_dto = AddAccountingRecordDto {
            amount: 150.00,
            record_time: "2024-01-05 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "部分冲账".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: Some(master_record.id),
            book_id: None,
            order_id: None,
        };

        let write_off_record = service.create_record(write_off_dto).await?;

        assert_eq!(write_off_record.write_off_id, Some(master_record.id));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_amount() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "原始记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 修改金额
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: Some(150.00),
            record_time: None,
            accounting_type: None,
            title: None,
            remark: None,
        };

        let modified = service.update_record(modify_dto).await?;

        assert_eq!(modified.amount, Decimal::new(15000, 2)); // 150.00
        assert_eq!(modified.title, "原始记录"); // 其他字段未改变

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_title() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "原标题".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 修改标题
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: Some("新标题".to_string()),
            remark: None,
        };

        let modified = service.update_record(modify_dto).await?;

        assert_eq!(modified.title, "新标题");
        assert_eq!(modified.amount, Decimal::new(10000, 2)); // 其他字段未改变

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_remark() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 添加备注
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: None,
            remark: Some(Some("这是备注".to_string())),
        };

        let modified = service.update_record(modify_dto).await?;

        assert_eq!(modified.remark, Some("这是备注".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_remove_remark() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录带备注
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: Some("原始备注".to_string()),
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 删除备注（设置为 None）
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: None,
            remark: Some(None), // 设置为 None
        };

        let modified = service.update_record(modify_dto).await?;

        assert_eq!(modified.remark, None);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 尝试修改不存在的记录
        let modify_dto = ModifyAccountingRecordDto {
            id: 999999,
            amount: Some(150.00),
            record_time: None,
            accounting_type: None,
            title: None,
            remark: None,
        };

        let result = service.update_record(modify_dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "记账记录不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_modify_record_after_posting() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 过账
        service.post_record(record.id).await?;

        // 尝试修改已过账的记录
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: Some(150.00),
            record_time: None,
            accounting_type: None,
            title: None,
            remark: None,
        };

        let result = service.update_record(modify_dto).await;

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "只有待入账状态的记录可修改"
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_post_record() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        assert_eq!(record.state, AccountingRecordState::PendingPosting);

        // 过账
        let posted = service.post_record(record.id).await?;

        assert_eq!(posted.id, record.id);
        assert_eq!(posted.state, AccountingRecordState::Posted);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_post_record_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 尝试过账不存在的记录
        let result = service.post_record(999999).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "记账记录不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_post_record_already_posted() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 第一次过账
        service.post_record(record.id).await?;

        // 第二次过账（应该仍然是成功状态，但已经是 Posted 状态）
        let posted = service.post_record(record.id).await?;

        assert_eq!(posted.state, AccountingRecordState::Posted);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_record_by_id_directly() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "查询测试".to_string(),
            channel: "Cash".to_string(),
            remark: Some("测试备注".to_string()),
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 直接查询（AccountingService 没有提供查询方法，我们直接查询数据库）
        let found = Entity::find_by_id(record.id).one(&txn).await?;

        assert!(found.is_some());
        let found_record = found.unwrap();
        assert_eq!(found_record.id, record.id);
        assert_eq!(found_record.title, "查询测试");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_record_not_found_directly() {
    run_in_transaction(|txn| async move {
        // 查询不存在的记录
        let found = Entity::find_by_id(999999).one(&txn).await?;

        assert!(found.is_none());

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== delete_record 测试 ====================

#[serial]
#[tokio::test]
async fn test_delete_record_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "待删除记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;
        assert_eq!(record.state, AccountingRecordState::PendingPosting);

        // 删除记录
        service.delete_record(record.id).await?;

        // 验证记录已被删除
        let found = Entity::find_by_id(record.id).one(&txn).await?;
        assert!(found.is_none());

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_record_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let result = service.delete_record(999999).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "记录不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_record_already_posted() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "已入账记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;
        service.post_record(record.id).await?;

        // 尝试删除已入账记录
        let result = service.delete_record(record.id).await;

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "已入账的记录只能冲账，不能删除"
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_record_with_write_off_association() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建主记录并过账
        let add_dto = AddAccountingRecordDto {
            amount: 200.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "主记录".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;
        service.post_record(record.id).await?;

        // 手动插入一条冲账关联记录（PendingPosting 状态），使主记录有关联
        let write_off_record = accounting_record::ActiveModel {
            id: Set(20240101999),
            amount: Set(Decimal::new(5000, 2)),
            record_time: Set(chrono::Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("冲账记录".to_string()),
            channel: Set(AccountingChannel::Cash),
            remark: Set(None),
            write_off_id: Set(Some(record.id)),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        write_off_record.insert(&txn).await?;

        // 尝试删除有冲账关联的记录（先把它改回 PendingPosting 来跳过状态检查）
        // 实际上主记录是 Posted 状态，删除会先检查状态
        // 所以我们直接测试 PendingPosting + 有关联的场景
        let pending_record = accounting_record::ActiveModel {
            id: Set(20240101998),
            amount: Set(Decimal::new(10000, 2)),
            record_time: Set(chrono::Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("待入账主记录".to_string()),
            channel: Set(AccountingChannel::BankCard),
            remark: Set(None),
            write_off_id: Set(None),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        pending_record.insert(&txn).await?;

        // 创建关联到此记录的冲账记录
        let related = accounting_record::ActiveModel {
            id: Set(20240101997),
            amount: Set(Decimal::new(3000, 2)),
            record_time: Set(chrono::Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("关联冲账".to_string()),
            channel: Set(AccountingChannel::Cash),
            remark: Set(None),
            write_off_id: Set(Some(20240101998)),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        related.insert(&txn).await?;

        // 尝试删除有冲账关联的待入账记录
        let result = service.delete_record(20240101998).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "不能删除有冲账关联的记录");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_record_updates_book_count() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 查看默认账本初始记录数
        let book_before = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("默认账本应存在");
        let count_before = book_before.record_count;

        // 创建记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "测试记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };

        let record = service.create_record(add_dto).await?;

        // 删除记录
        service.delete_record(record.id).await?;

        // 验证账本 record_count 恢复到初始值
        let book_after = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("默认账本应存在");

        assert_eq!(book_after.record_count, count_before);

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== batch_post_records 测试 ====================

#[serial]
#[tokio::test]
async fn test_batch_post_records_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建多条记录
        let mut record_ids = Vec::new();
        for i in 1..=3 {
            let dto = AddAccountingRecordDto {
                amount: 100.00 * i as f64,
                record_time: "2024-01-01 12:00:00".to_string(),
                accounting_type: "Expenditure".to_string(),
                title: format!("记录{}", i),
                channel: "Cash".to_string(),
                remark: None,
                write_off_id: None,
                book_id: None,
                order_id: None,
            };
            let record = service.create_record(dto).await?;
            record_ids.push(record.id);
        }

        // 批量入账
        let posted = service.batch_post_records(record_ids.clone()).await?;

        assert_eq!(posted.len(), 3);
        for record in &posted {
            assert_eq!(record.state, AccountingRecordState::Posted);
        }

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_batch_post_records_empty_list() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let result = service.batch_post_records(vec![]).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "请选择要入账的记录");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_batch_post_records_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let result = service.batch_post_records(vec![999998, 999999]).await;

        assert!(result.is_err());
        let err_msg = result.unwrap_err().to_string();
        assert!(
            err_msg.contains("记录 ID 不存在"),
            "错误信息应包含'记录 ID 不存在'，实际: {}",
            err_msg
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_batch_post_records_already_posted() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账一条记录
        let add_dto = AddAccountingRecordDto {
            amount: 100.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Expenditure".to_string(),
            title: "已入账记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let record = service.create_record(add_dto).await?;
        service.post_record(record.id).await?;

        // 创建一条待入账记录
        let add_dto2 = AddAccountingRecordDto {
            amount: 50.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "待入账记录".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let record2 = service.create_record(add_dto2).await?;

        // 尝试批量入账包含已入账的记录
        let result = service
            .batch_post_records(vec![record.id, record2.id])
            .await;

        assert!(result.is_err());
        let err_msg = result.unwrap_err().to_string();
        assert!(
            err_msg.contains("已经是入账状态"),
            "错误信息应包含'已经是入账状态'，实际: {}",
            err_msg
        );

        // 验证待入账记录未被影响（事务回滚）
        let record2_check = Entity::find_by_id(record2.id).one(&txn).await?.unwrap();
        assert_eq!(record2_check.state, AccountingRecordState::PendingPosting);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_batch_post_single_record() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let add_dto = AddAccountingRecordDto {
            amount: 200.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "单条入账".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let record = service.create_record(add_dto).await?;

        // 单条批量入账
        let posted = service.batch_post_records(vec![record.id]).await?;

        assert_eq!(posted.len(), 1);
        assert_eq!(posted[0].state, AccountingRecordState::Posted);
        assert_eq!(posted[0].id, record.id);

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== create_write_off_record 测试 ====================

#[serial]
#[tokio::test]
async fn test_create_write_off_record_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "预付款".to_string(),
            channel: "BankCard".to_string(),
            remark: Some("原始备注".to_string()),
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 创建冲账记录
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -200.00,
            channel: None,
            remark: Some("部分冲账".to_string()),
            record_time: None,
        };

        let write_off = service.create_write_off_record(write_off_dto).await?;

        assert!(write_off.id > 0);
        assert_eq!(write_off.accounting_type, AccountingType::WriteOff);
        assert_eq!(write_off.title, "冲账 - 预付款");
        assert_eq!(write_off.amount, Decimal::new(-20000, 2));
        assert_eq!(write_off.write_off_id, Some(original.id));
        assert_eq!(write_off.state, AccountingRecordState::Posted);
        assert_eq!(write_off.channel, AccountingChannel::BankCard); // 继承原始记录渠道
        assert_eq!(write_off.remark, Some("部分冲账".to_string()));

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_original_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: 999999,
            amount: -100.00,
            channel: None,
            remark: None,
            record_time: None,
        };

        let result = service.create_write_off_record(write_off_dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "原始记录不存在");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_original_not_posted() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建但不过账
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "待入账".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;

        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -100.00,
            channel: None,
            remark: None,
            record_time: None,
        };

        let result = service.create_write_off_record(write_off_dto).await;

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "只能对已入账的记录进行冲账"
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_cannot_write_off_write_off() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "原始记录".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 创建冲账记录
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -100.00,
            channel: None,
            remark: None,
            record_time: None,
        };
        let write_off = service.create_write_off_record(write_off_dto).await?;

        // 尝试对冲账记录再冲账
        let write_off_dto2 = CreateWriteOffRecordDto {
            original_record_id: write_off.id,
            amount: -50.00,
            channel: None,
            remark: None,
            record_time: None,
        };

        let result = service.create_write_off_record(write_off_dto2).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "不能对冲账记录进行冲账");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_amount_exceeds_original() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录（金额 200）
        let add_dto = AddAccountingRecordDto {
            amount: 200.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "小额记录".to_string(),
            channel: "Cash".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 冲账金额导致净额小于 0
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -300.00, // 原始 200 - 300 = -100 < 0
            channel: None,
            remark: None,
            record_time: None,
        };

        let result = service.create_write_off_record(write_off_dto).await;

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "冲账金额与原始金额的总和不能小于 0"
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_cumulative_amount_exceeds() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录（金额 500）
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "多次冲账测试".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 第一次冲账 -300
        let write_off_dto1 = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -300.00,
            channel: None,
            remark: Some("第一次冲账".to_string()),
            record_time: None,
        };
        service.create_write_off_record(write_off_dto1).await?;

        // 第二次冲账 -300（累计 -600，超过原始 500）
        let write_off_dto2 = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -300.00,
            channel: None,
            remark: Some("第二次冲账".to_string()),
            record_time: None,
        };

        let result = service.create_write_off_record(write_off_dto2).await;

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "冲账金额与原始金额的总和不能小于 0"
        );

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_custom_channel() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录（BankCard 渠道）
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "测试渠道".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 使用自定义渠道
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -100.00,
            channel: Some("Cash".to_string()),
            remark: None,
            record_time: None,
        };

        let write_off = service.create_write_off_record(write_off_dto).await?;

        // 应使用自定义渠道而非继承
        assert_eq!(write_off.channel, AccountingChannel::Cash);
        assert_ne!(write_off.channel, AccountingChannel::BankCard);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_custom_time() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 创建并过账原始记录
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "测试时间".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 指定自定义时间
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -100.00,
            channel: None,
            remark: None,
            record_time: Some("2024-06-15 08:30:00".to_string()),
        };

        let write_off = service.create_write_off_record(write_off_dto).await?;

        let expected_time =
            chrono::NaiveDateTime::parse_from_str("2024-06-15 08:30:00", "%Y-%m-%d %H:%M:%S")
                .unwrap();
        assert_eq!(write_off.record_time, expected_time);

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_write_off_record_updates_book_count() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 获取初始记录数
        let book_before = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("默认账本应存在");
        let count_before = book_before.record_count;

        // 创建并过账原始记录
        let add_dto = AddAccountingRecordDto {
            amount: 500.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "测试记录数".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: None,
        };
        let original = service.create_record(add_dto).await?;
        service.post_record(original.id).await?;

        // 创建冲账记录
        let write_off_dto = CreateWriteOffRecordDto {
            original_record_id: original.id,
            amount: -100.00,
            channel: None,
            remark: None,
            record_time: None,
        };
        service.create_write_off_record(write_off_dto).await?;

        // 验证 record_count 增加了 2（原始记录 +1，冲账记录 +1）
        let book_after = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("默认账本应存在");

        assert_eq!(book_after.record_count, count_before + 2);

        Ok(())
    })
    .await
    .unwrap();
}

// ==================== get_record_by_order_id 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_record_by_order_id_with_record() {
    run_in_transaction(|db| async move {
        let service = AccountingService::new(db.clone());

        // 创建带 order_id 的记账记录
        let dto = AddAccountingRecordDto {
            amount: 200.00,
            record_time: "2024-01-01 12:00:00".to_string(),
            accounting_type: "Income".to_string(),
            title: "销售订单-#1".to_string(),
            channel: "BankCard".to_string(),
            remark: None,
            write_off_id: None,
            book_id: None,
            order_id: Some(2024010100001),
        };

        let record = service.create_record(dto).await?;
        assert_eq!(record.order_id, Some(2024010100001));

        // 根据 order_id 查询
        let found = service.get_records_by_order_id(2024010100001).await?;

        assert!(!found.is_empty());
        let found_record = found.into_iter().next().unwrap();
        assert_eq!(found_record.id, record.id);
        assert_eq!(found_record.order_id, Some(2024010100001));
        assert_eq!(found_record.title, "销售订单-#1");

        Ok(())
    })
    .await
    .unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_record_by_order_id_no_record() {
    run_in_transaction(|db| async move {
        let service = AccountingService::new(db.clone());

        let found = service.get_records_by_order_id(999999).await?;

        assert!(found.is_empty());

        Ok(())
    })
    .await
    .unwrap();
}

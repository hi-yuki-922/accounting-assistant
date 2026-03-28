use accounting_assistant_lib::entity::accounting_record::{self, Entity};
use accounting_assistant_lib::enums::{AccountingType, AccountingChannel, AccountingRecordState};
use accounting_assistant_lib::services::accounting::dto::{AddAccountingRecordDto, ModifyAccountingRecordDto};
use accounting_assistant_lib::services::AccountingService;
use accounting_assistant_lib::services::accounting_book::DEFAULT_BOOK_ID;
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, Set, EntityTrait, ColumnTrait, QueryFilter};
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
        };

        let record = service.add_record(dto).await?;

        assert!(record.id > 0);
        assert_eq!(record.title, "工资收入");
        assert_eq!(record.amount, Decimal::new(10050, 2)); // 100.50
        assert_eq!(record.accounting_type, AccountingType::Income);
        assert_eq!(record.channel, AccountingChannel::BankCard);
        assert_eq!(record.state, AccountingRecordState::PendingPosting);
        assert_eq!(record.remark, Some("1月工资".to_string()));

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::Expenditure);
        assert_eq!(record.channel, AccountingChannel::Wechat);

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::InvestmentIncome);

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(dto).await?;

        assert_eq!(record.accounting_type, AccountingType::InvestmentLoss);

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(dto).await?;

        assert_eq!(record.book_id, Some(DEFAULT_BOOK_ID));

        Ok(())
    }).await.unwrap();
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
        };

        let master_record = service.add_record(master_dto).await?;

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
        };

        let write_off_record = service.add_record(write_off_dto).await?;

        assert_eq!(write_off_record.write_off_id, Some(master_record.id));

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 修改金额
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: Some(150.00),
            record_time: None,
            accounting_type: None,
            title: None,
            remark: None,
        };

        let modified = service.modify_record(modify_dto).await?;

        assert_eq!(modified.amount, Decimal::new(15000, 2)); // 150.00
        assert_eq!(modified.title, "原始记录"); // 其他字段未改变

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 修改标题
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: Some("新标题".to_string()),
            remark: None,
        };

        let modified = service.modify_record(modify_dto).await?;

        assert_eq!(modified.title, "新标题");
        assert_eq!(modified.amount, Decimal::new(10000, 2)); // 其他字段未改变

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 添加备注
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: None,
            remark: Some(Some("这是备注".to_string())),
        };

        let modified = service.modify_record(modify_dto).await?;

        assert_eq!(modified.remark, Some("这是备注".to_string()));

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 删除备注（设置为 None）
        let modify_dto = ModifyAccountingRecordDto {
            id: record.id,
            amount: None,
            record_time: None,
            accounting_type: None,
            title: None,
            remark: Some(None), // 设置为 None
        };

        let modified = service.modify_record(modify_dto).await?;

        assert_eq!(modified.remark, None);

        Ok(())
    }).await.unwrap();
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

        let result = service.modify_record(modify_dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "Accounting record not found");

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

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

        let result = service.modify_record(modify_dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "Only records with state PendingPosting can be modified");

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        assert_eq!(record.state, AccountingRecordState::PendingPosting);

        // 过账
        let posted = service.post_record(record.id).await?;

        assert_eq!(posted.id, record.id);
        assert_eq!(posted.state, AccountingRecordState::Posted);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_post_record_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingService::new(txn.clone());

        // 尝试过账不存在的记录
        let result = service.post_record(999999).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "Accounting record not found");

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 第一次过账
        service.post_record(record.id).await?;

        // 第二次过账（应该仍然是成功状态，但已经是 Posted 状态）
        let posted = service.post_record(record.id).await?;

        assert_eq!(posted.state, AccountingRecordState::Posted);

        Ok(())
    }).await.unwrap();
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
        };

        let record = service.add_record(add_dto).await?;

        // 直接查询（AccountingService 没有提供查询方法，我们直接查询数据库）
        let found = Entity::find_by_id(record.id)
            .one(&txn)
            .await?;

        assert!(found.is_some());
        let found_record = found.unwrap();
        assert_eq!(found_record.id, record.id);
        assert_eq!(found_record.title, "查询测试");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_query_record_not_found_directly() {
    run_in_transaction(|txn| async move {
        // 查询不存在的记录
        let found = Entity::find_by_id(999999)
            .one(&txn)
            .await?;

        assert!(found.is_none());

        Ok(())
    }).await.unwrap();
}

// 注意：以下测试场景由于服务未提供相关方法，暂时跳过：
// - 删除记录测试（服务未提供 delete_record 方法）
// - 统计功能测试（服务未提供统计方法）
// - 日期范围查询（服务未提供查询方法）
// - 分页查询（服务未提供查询方法）

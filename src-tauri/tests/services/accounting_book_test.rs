use accounting_assistant_lib::entity::accounting_book::{self, ActiveModel, Entity, Model};
use accounting_assistant_lib::entity::accounting_record;
use accounting_assistant_lib::enums::{AccountingType, AccountingChannel};
use accounting_assistant_lib::services::accounting_book::dto::{CreateBookDto, UpdateBookDto};
use accounting_assistant_lib::services::AccountingBookService;
use accounting_assistant_lib::services::accounting_book::DEFAULT_BOOK_ID;
use chrono::Local;
use sea_orm::{ActiveModelTrait, Set, EntityTrait, ColumnTrait, QueryFilter, PaginatorTrait};
use rust_decimal::Decimal;

use crate::context::run_in_transaction;
use serial_test::serial;

#[serial]
#[tokio::test]
async fn test_create_book_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        let dto = CreateBookDto {
            title: "测试账本".to_string(),
            description: None,
            icon: None,
        };

        let book = service.create_book(dto).await?;

        assert!(book.id > 0);
        assert_eq!(book.title, "测试账本");

        // 验证数据库中的记录
        let found = Entity::find_by_id(book.id)
            .one(&txn)
            .await?
            .expect("Book not found");

        assert_eq!(found.title, "测试账本");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_book_empty_title() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        let dto = CreateBookDto {
            title: "".to_string(),
            description: None,
            icon: None,
        };

        let result = service.create_book(dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "账本标题不能为空");

        // 验证数据库中没有创建新记录（默认账簿已存在）
        let count = Entity::find()
            .count(&txn)
            .await?;

        // 由于默认账簿已存在，count 应该是 1 而不是 0
        assert_eq!(count, 1);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_book_duplicate_title() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        let dto = CreateBookDto {
            title: "重复标题".to_string(),
            description: None,
            icon: None,
        };

        // 第一次创建应该成功
        let book1 = service.create_book(dto).await?;
        assert_eq!(book1.title, "重复标题");

        // 第二次创建同名账本（由于我们的实现没有限制唯一性，这实际上会成功）
        // 实际测试中需要根据业务需求调整
        let dto2 = CreateBookDto {
            title: "重复标题".to_string(),
            description: None,
            icon: None,
        };
        let book2 = service.create_book(dto2).await?;

        // 如果需要唯一性，这里应该失败
        // 但当前实现没有限制，所以我们验证两条记录都存在
        assert_eq!(book2.title, "重复标题");
        assert_ne!(book1.id, book2.id);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_book_by_id_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建一个账本
        let dto = CreateBookDto {
            title: "查询测试账本".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(dto).await?;

        // 根据 ID 查询
        let found = service.get_book_by_id(book.id).await?;

        assert!(found.is_some());
        let found_book = found.unwrap();
        assert_eq!(found_book.id, book.id);
        assert_eq!(found_book.title, "查询测试账本");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_book_by_id_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 查询不存在的 ID
        let found = service.get_book_by_id(999999).await?;

        assert!(found.is_none());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_books_empty() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        let books = service.get_books().await?;

        // 存在默认账本，因此 books.len() 最小值应该为1
        assert_eq!(books.len(), 1);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_books_multiple() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建多个账本
        for i in 1..=3 {
            let dto = CreateBookDto {
                title: format!("账本{}", i),
                description: None,
                icon: None,
            };
            service.create_book(dto).await?;
        }

        let books = service.get_books().await?;

        // 创建账本数 + 默认账本
        assert_eq!(books.len(), 4);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_book_title_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建账本
        let dto = CreateBookDto {
            title: "原标题".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(dto).await?;

        // 更新标题
        let update_dto = UpdateBookDto {
            id: book.id,
            title: Some("新标题".to_string()),
            description: None,
            icon: None,
        };

        let updated = service.update_book(update_dto).await?;

        assert!(updated.is_some());
        let updated_book = updated.unwrap();
        assert_eq!(updated_book.title, "新标题");
        assert_eq!(updated_book.id, book.id);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_book_empty_title() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建账本
        let dto = CreateBookDto {
            title: "原标题".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(dto).await?;

        // 尝试更新为空标题
        let update_dto = UpdateBookDto {
            id: book.id,
            title: Some("".to_string()),
            description: None,
            icon: None,
        };

        let result = service.update_book(update_dto).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "账本标题不能为空");

        // 验证标题未改变
        let found = Entity::find_by_id(book.id)
            .one(&txn)
            .await?
            .expect("Book not found");

        assert_eq!(found.title, "原标题");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_update_book_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 尝试更新不存在的账本
        let update_dto = UpdateBookDto {
            id: 999999,
            title: Some("新标题".to_string()),
            description: None,
            icon: None,
        };

        let updated = service.update_book(update_dto).await?;

        assert!(updated.is_none());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_book_empty() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建账本
        let dto = CreateBookDto {
            title: "待删除账本".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(dto).await?;

        // 删除账本
        let result = service.delete_book(book.id).await?;

        assert!(result);

        // 验证账本已删除
        let found = Entity::find_by_id(book.id)
            .one(&txn)
            .await?;

        assert!(found.is_none());

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_book_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 尝试删除不存在的账本
        let result = service.delete_book(999999).await?;

        assert!(!result);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_delete_default_book() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 尝试删除默认账本
        let result = service.delete_book(DEFAULT_BOOK_ID).await;

        assert!(result.is_err());
        assert_eq!(result.unwrap_err().to_string(), "默认账本不能删除");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_default_book_when_none_exists() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建默认账本
        service.create_default_book().await?;

        // 验证默认账本存在
        let book = Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("Default book not found");

        assert_eq!(book.title, "未归类账目");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_create_default_book_when_already_exists() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 第一次创建默认账本
        service.create_default_book().await?;

        let book1 = Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("Default book not found");

        // 第二次创建（应该跳过）
        service.create_default_book().await?;

        let book2 = Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?
            .expect("Default book not found");

        // 验证账本没有重复
        assert_eq!(book1.id, book2.id);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_records_by_book_id() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建账本
        let book_dto = CreateBookDto {
            title: "测试账本".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(book_dto).await?;

        // 创建一些记录（直接插入数据库，因为 AccountingBookService 不提供创建记录的方法）
        use accounting_assistant_lib::entity::accounting_record;
        use accounting_assistant_lib::enums::AccountingType;
        use accounting_assistant_lib::enums::AccountingChannel;

        let record1 = accounting_record::ActiveModel {
            id: Set(20240101001),
            amount: Set(Decimal::new(10000, 2)), // 100.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("记录1".to_string()),
            channel: Set(AccountingChannel::Cash),
            remark: Set(Some("备注1".to_string())),
            book_id: Set(Some(book.id)),
            ..Default::default()
        };

        let record2 = accounting_record::ActiveModel {
            id: Set(20240101002),
            amount: Set(Decimal::new(5000, 2)), // 50.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("记录2".to_string()),
            channel: Set(AccountingChannel::BankCard),
            remark: Set(Some("备注2".to_string())),
            book_id: Set(Some(book.id)),
            ..Default::default()
        };

        record1.insert(&txn).await?;
        record2.insert(&txn).await?;

        // 查询账本下的记录
        let records = service.get_records_by_book_id(book.id).await?;

        assert_eq!(records.len(), 2);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_records_by_book_id_empty() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建账本
        let book_dto = CreateBookDto {
            title: "空账本".to_string(),
            description: None,
            icon: None,
        };
        let book = service.create_book(book_dto).await?;

        // 查询账本下的记录（应该是空的）
        let records = service.get_records_by_book_id(book.id).await?;

        assert_eq!(records.len(), 0);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_uncategorized_records() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建默认账本
        service.create_default_book().await?;

        // 插入一些未归类记录
        use accounting_assistant_lib::entity::accounting_record;
        use accounting_assistant_lib::enums::AccountingType;
        use accounting_assistant_lib::enums::AccountingChannel;

        let record1 = accounting_record::ActiveModel {
            id: Set(20240101001),
            amount: Set(Decimal::new(10000, 2)),
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("记录1".to_string()),
            channel: Set(AccountingChannel::Cash),
            book_id: Set(None), // 未归类
            ..Default::default()
        };

        let record2 = accounting_record::ActiveModel {
            id: Set(20240101002),
            amount: Set(Decimal::new(5000, 2)),
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("记录2".to_string()),
            channel: Set(AccountingChannel::BankCard),
            book_id: Set(Some(DEFAULT_BOOK_ID)), // 默认账本
            ..Default::default()
        };

        record1.insert(&txn).await?;
        record2.insert(&txn).await?;

        // 查询未归类记录
        let records = service.get_uncategorized_records().await?;

        assert_eq!(records.len(), 2);

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_write_off_records_by_id() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建主记录
        use accounting_assistant_lib::entity::accounting_record;
        use accounting_assistant_lib::enums::AccountingType;
        use accounting_assistant_lib::enums::AccountingChannel;

        let master_record = accounting_record::ActiveModel {
            id: Set(20240101001),
            amount: Set(Decimal::new(10000, 2)),
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("主记录".to_string()),
            channel: Set(AccountingChannel::Cash),
            ..Default::default()
        };

        master_record.insert(&txn).await?;

        // 创建冲账关联记录
        let write_off_record1 = accounting_record::ActiveModel {
            id: Set(20240101002),
            amount: Set(Decimal::new(3000, 2)),
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("冲账记录1".to_string()),
            channel: Set(AccountingChannel::Cash),
            write_off_id: Set(Some(20240101001)),
            ..Default::default()
        };

        let write_off_record2 = accounting_record::ActiveModel {
            id: Set(20240101003),
            amount: Set(Decimal::new(2000, 2)),
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("冲账记录2".to_string()),
            channel: Set(AccountingChannel::Cash),
            write_off_id: Set(Some(20240101001)),
            ..Default::default()
        };

        write_off_record1.insert(&txn).await?;
        write_off_record2.insert(&txn).await?;

        // 查询冲账关联记录
        let records = service.get_write_off_records_by_id(20240101001).await?;

        assert_eq!(records.len(), 2);

        Ok(())
    }).await.unwrap();
}

// ==================== get_record_write_off_details 测试 ====================

#[serial]
#[tokio::test]
async fn test_get_record_write_off_details_success() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建主记录
        let master_record = accounting_record::ActiveModel {
            id: Set(20240101101),
            amount: Set(Decimal::new(10000, 2)), // 100.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("主记录".to_string()),
            channel: Set(AccountingChannel::BankCard),
            remark: Set(Some("原始备注".to_string())),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        master_record.insert(&txn).await?;

        // 创建两条冲账记录
        let write_off1 = accounting_record::ActiveModel {
            id: Set(20240101102),
            amount: Set(Decimal::new(-3000, 2)), // -30.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("冲账1".to_string()),
            channel: Set(AccountingChannel::BankCard),
            remark: Set(Some("第一次冲账".to_string())),
            write_off_id: Set(Some(20240101101)),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        write_off1.insert(&txn).await?;

        let write_off2 = accounting_record::ActiveModel {
            id: Set(20240101103),
            amount: Set(Decimal::new(-2000, 2)), // -20.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Expenditure),
            title: Set("冲账2".to_string()),
            channel: Set(AccountingChannel::Cash),
            remark: Set(None),
            write_off_id: Set(Some(20240101101)),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        write_off2.insert(&txn).await?;

        // 获取冲账详情
        let details = service.get_record_write_off_details(20240101101).await?;

        // 验证原始金额
        assert_eq!(details.original_amount, Decimal::new(10000, 2));

        // 验证冲账记录数量
        assert_eq!(details.write_off_records.len(), 2);

        // 验证冲账记录内容
        let amounts: Vec<Decimal> = details.write_off_records.iter().map(|r| r.amount).collect();
        assert!(amounts.contains(&Decimal::new(-3000, 2)));
        assert!(amounts.contains(&Decimal::new(-2000, 2)));

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_record_write_off_details_not_found() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        let result = service.get_record_write_off_details(999999).await;

        assert!(result.is_err());
        let err = result.err().unwrap();
        assert_eq!(err.to_string(), "记录不存在");

        Ok(())
    }).await.unwrap();
}

#[serial]
#[tokio::test]
async fn test_get_record_write_off_details_empty() {
    run_in_transaction(|txn| async move {
        let service = AccountingBookService::new(txn.clone());

        // 创建主记录（无冲账关联）
        let master_record = accounting_record::ActiveModel {
            id: Set(20240101201),
            amount: Set(Decimal::new(50000, 2)), // 500.00
            record_time: Set(Local::now().naive_local()),
            accounting_type: Set(AccountingType::Income),
            title: Set("无冲账记录".to_string()),
            channel: Set(AccountingChannel::BankCard),
            remark: Set(None),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            ..Default::default()
        };
        master_record.insert(&txn).await?;

        // 获取冲账详情
        let details = service.get_record_write_off_details(20240101201).await?;

        // 验证原始金额
        assert_eq!(details.original_amount, Decimal::new(50000, 2));

        // 验证冲账记录为空
        assert!(details.write_off_records.is_empty());

        Ok(())
    }).await.unwrap();
}

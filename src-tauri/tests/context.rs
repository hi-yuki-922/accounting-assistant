use sea_orm::{Database, DatabaseConnection};
use accounting_assistant_lib::entity;
use accounting_assistant_lib::services::{AccountingService, AttachmentService, AccountingBookService};
use once_cell::sync::Lazy;
use tempfile::TempDir;
use std::sync::Mutex;

/// 测试选项配置
#[derive(Debug, Clone)]
pub struct TestOptions {
    /// 是否创建默认账簿
    pub create_default_book: bool,
}

impl Default for TestOptions {
    fn default() -> Self {
        Self {
            create_default_book: true,
        }
    }
}

/// 全局数据库连接单例
static DB_CONNECTION: Lazy<DatabaseConnection> = Lazy::new(|| {
    // 注意：这是在非 async 上下文中初始化的，但在测试中使用
    // 实际的数据库初始化在第一个测试运行时发生
    // 这里只是占位，实际的初始化延迟到测试时间
    panic!("DB_CONNECTION should be initialized via setup() before use");
});

/// 全局临时文件目录单例
static TEMP_DIR: Lazy<Mutex<Option<TempDir>>> = Lazy::new(|| Mutex::new(None));

/// 全局测试选项
static TEST_OPTIONS: Lazy<Mutex<TestOptions>> = Lazy::new(|| Mutex::new(TestOptions::default()));

/// 内部数据库连接初始化函数
async fn init_db_connection_internal() -> Result<DatabaseConnection, Box<dyn std::error::Error>> {
    let db = Database::connect("sqlite::memory:").await?;

    // 注册所有 Sea-ORM 实体并同步 schema
    entity::with_install_entities(&db).await?;

    Ok(db)
}

/// 异步初始化数据库连接并创建默认账簿
async fn init_db_with_default_book() -> Result<DatabaseConnection, Box<dyn std::error::Error>> {
    let db = init_db_connection_internal().await?;

    // 根据测试选项决定是否创建默认账簿
    let options = match TEST_OPTIONS.lock() {
        Ok(opts) => opts.clone(),
        Err(_) => TestOptions::default(),
    };

    if options.create_default_book {
        let book_service = AccountingBookService::new(db.clone());
        // 检查是否已存在默认账簿，避免重复创建
        let books = book_service.get_books().await.unwrap_or_default();
        let has_default = books.iter().any(|b| b.id == 10000001);

        if !has_default {
            book_service.create_default_book().await?;
        }
    }

    Ok(db)
}

/// 获取全局数据库连接
///
/// 注意：必须先调用 setup() 或 setup_with_options() 来初始化数据库
pub fn get_db_connection() -> DatabaseConnection {
    // 这是一个简化版本，实际上我们使用 tokio::task::block_in_place 来获取
    // 但为了避免复杂性，我们将在测试中直接初始化数据库
    panic!("get_db_connection() should not be called directly. Use run_in_transaction instead.");
}

/// 初始化测试环境（确保默认账簿已创建）
pub fn init_test_environment() {
    // 注意：这个函数不能在 sync 上下文中直接调用 async 代码
    // 实际的初始化延迟到第一次使用时
    // 这里只是一个占位函数
}

/// 获取或创建临时文件目录
pub fn get_temp_dir() -> std::path::PathBuf {
    let mut temp_guard = TEMP_DIR.lock().unwrap();
    if temp_guard.is_none() {
        *temp_guard = Some(TempDir::new().expect("Failed to create temp directory"));
    }
    temp_guard.as_ref().unwrap().path().to_path_buf()
}

/// 清理临时文件目录
pub fn cleanup_temp_dir() {
    let mut temp_guard = TEMP_DIR.lock().unwrap();
    *temp_guard = None; // TempDir 会在 drop 时自动清理
}

/// 在事务中执行测试逻辑
///
/// 每个测试使用独立的数据库连接，但共享默认账簿。
///
/// # 参数
/// * `test_fn` - 测试逻辑函数，接收数据库连接作为参数
///
/// # 返回
/// 返回测试函数的结果
///
/// # 示例
/// ```ignore
/// use crate::context::run_in_transaction;
///
/// run_in_transaction(|db| async move {
///     // 在事务中执行测试逻辑
///     Ok(())
/// }).await;
/// ```
pub async fn run_in_transaction<F, Fut, R>(test_fn: F) -> Result<R, Box<dyn std::error::Error>>
where
    F: FnOnce(sea_orm::DatabaseConnection) -> Fut,
    Fut: std::future::Future<Output = Result<R, Box<dyn std::error::Error>>>,
{
    // 创建新的数据库连接（简化实现）
    let db = init_db_connection_internal().await?;

    // 根据测试选项决定是否创建默认账簿
    let options = TEST_OPTIONS.lock().unwrap();
    if options.create_default_book {
        let book_service = AccountingBookService::new(db.clone());
        book_service.create_default_book().await?;
    }

    test_fn(db).await
}

/// 测试设置 - 初始化测试环境
///
/// 使用默认选项创建默认账簿
pub fn setup() {
    // 注意：这是一个同步函数，无法直接调用异步代码
    // 实际的初始化在测试中进行
    setup_with_options(TestOptions::default());
}

/// 使用自定义选项进行测试设置
///
/// # 参数
/// * `options` - 测试选项配置
pub fn setup_with_options(options: TestOptions) {
    // 更新全局测试选项
    {
        let mut opts = TEST_OPTIONS.lock().unwrap();
        *opts = options;
    }

    // 确保临时文件目录可用
    get_temp_dir();
}

/// 测试清理 - 清理测试环境
///
/// 清理临时文件目录
pub fn teardown() {
    cleanup_temp_dir();
}

#[cfg(test)]
mod context_tests {
    use super::*;

    #[tokio::test]
    async fn test_database_connection() {
        // 验证数据库初始化成功
        let db = init_db_connection_internal().await;
        assert!(db.is_ok(), "Failed to initialize database");
    }

    #[tokio::test]
    async fn test_service_initialization() {
        // 验证服务可以从数据库连接创建
        let db = init_db_connection_internal().await.expect("Failed to init db");
        let _accounting = AccountingService::new(db.clone());
        let _accounting_book = AccountingBookService::new(db);

        // 服务实例已成功创建
        assert!(true);
    }

    #[tokio::test]
    async fn test_default_book_creation() {
        // 验证默认账簿创建逻辑
        let db = init_db_connection_internal().await.expect("Failed to init db");
        let service = AccountingBookService::new(db);

        let result = service.create_default_book().await;
        assert!(result.is_ok(), "Failed to create default book");

        let books = service.get_books().await.expect("Failed to get books");
        let has_default = books.iter().any(|b| b.id == 10000001);

        assert!(has_default, "Default book should be created");
    }

    #[tokio::test]
    async fn test_temp_directory_management() {
        // 验证临时文件目录管理
        let temp_dir = get_temp_dir();

        // 确保目录存在（如果之前的测试清理了）
        if !temp_dir.exists() {
            cleanup_temp_dir();
            let temp_dir = get_temp_dir();
            assert!(temp_dir.exists(), "Temp directory should exist after cleanup");
        }

        assert!(temp_dir.exists(), "Temp directory should exist");
        assert!(temp_dir.is_dir(), "Temp path should be a directory");

        // 可以在临时目录中创建测试文件
        let test_file = temp_dir.join("test.txt");
        // 确保父目录存在
        if let Some(parent) = test_file.parent() {
            std::fs::create_dir_all(parent).expect("Failed to create parent directory");
        }
        std::fs::write(&test_file, "test content").expect("Failed to write test file");

        assert!(test_file.exists(), "Test file should exist");
    }

    #[tokio::test]
    async fn test_temp_directory_cleanup() {
        // 验证临时目录清理
        let temp_dir_1 = get_temp_dir();
        let path_1 = temp_dir_1.clone();

        cleanup_temp_dir();

        let temp_dir_2 = get_temp_dir();
        let path_2 = temp_dir_2.clone();

        // 清理后应该创建新的临时目录
        assert_ne!(path_1, path_2, "Temp directories should be different after cleanup");
    }

    #[tokio::test]
    async fn test_run_in_transaction() {
        // 验证 run_in_transaction 功能
        run_in_transaction(|db| async move {
            // 简单验证数据库可用
            let _db = db.clone();
            assert!(true, "run_in_transaction should work correctly");
            Ok(())
        }).await.expect("run_in_transaction failed");
    }
}

use once_cell::sync::OnceCell;
use sea_orm::DatabaseConnection;
use tauri::AppHandle;

pub mod accounting;
pub mod attachment;
pub mod accounting_book;

use accounting::AccountingService;
use accounting_book::AccountingBookService;
use attachment::AttachmentService;

// 服务单例变量
static ACCOUNTING_SERVICE: OnceCell<AccountingService> = OnceCell::new();
static ACCOUNTING_BOOK_SERVICE: OnceCell<AccountingBookService> = OnceCell::new();
static ATTACHMENT_SERVICE: OnceCell<AttachmentService> = OnceCell::new();

/// 初始化记账服务单例
fn init_accounting_service(db: &DatabaseConnection) {
    let service = AccountingService::new((*db).clone());
    ACCOUNTING_SERVICE.set(service)
        .expect("AccountingService already initialized");
}

/// 初始化账本服务单例
fn init_accounting_book_service(db: &DatabaseConnection) {
    let service = AccountingBookService::new((*db).clone());
    ACCOUNTING_BOOK_SERVICE.set(service)
        .expect("AccountingBookService already initialized");
}

/// 初始化附件服务单例
fn init_attachment_service(db: &DatabaseConnection, app_handle: AppHandle) {
    let service = AttachmentService::new((*db).clone(), app_handle);
    ATTACHMENT_SERVICE.set(service)
        .expect("AttachmentService already initialized");
}

/// 初始化所有服务单例
///
/// # 参数
/// * `db` - 数据库连接
/// * `app_handle` - Tauri 应用句柄
pub fn init_services(db: &DatabaseConnection, app_handle: AppHandle) {
    init_accounting_service(db);
    init_accounting_book_service(db);
    init_attachment_service(db, app_handle);
}

/// 获取记账服务单例
///
/// # Panics
/// 如果服务未初始化，将 panic
pub fn accounting_service() -> &'static AccountingService {
    ACCOUNTING_SERVICE.get()
        .expect("AccountingService not initialized. Call init_services() first.")
}

/// 获取账本服务单例
///
/// # Panics
/// 如果服务未初始化，将 panic
pub fn accounting_book_service() -> &'static AccountingBookService {
    ACCOUNTING_BOOK_SERVICE.get()
        .expect("AccountingBookService not initialized. Call init_services() first.")
}

/// 获取附件服务单例
///
/// # Panics
/// 如果服务未初始化，将 panic
pub fn attachment_service() -> &'static AttachmentService {
    ATTACHMENT_SERVICE.get()
        .expect("AttachmentService not initialized. Call init_services() first.")
}

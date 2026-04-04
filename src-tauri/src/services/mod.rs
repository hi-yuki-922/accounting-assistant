pub mod accounting;
pub mod accounting_book;
pub mod attachment;
pub mod chat;
pub mod customer;
pub mod order;
pub mod product;

pub use accounting::AccountingService;
pub use accounting_book::AccountingBookService;
pub use attachment::AttachmentService;
pub use chat::ChatService;
pub use customer::CustomerService;
pub use order::OrderService;
pub use product::ProductService;
use sea_orm::DatabaseConnection;
use tauri::{App, Manager};

// 服务模块通过 Tauri app.manage() 进行依赖注入
// 这里只提供服务类型的导出，具体的实例管理和生命周期由 Tauri 的 State 机制处理

pub fn init_services(
    app: &App,
    db: &DatabaseConnection,
    rt: &tokio::runtime::Runtime,
) -> Result<(), Box<dyn std::error::Error>> {
    let accounting_service = AccountingService::new(db.clone());
    let attachment_service = AttachmentService::new(db.clone());
    let accounting_book_service = AccountingBookService::new(db.clone());
    let chat_service = ChatService::new(db.clone());
    let customer_service = CustomerService::new(db.clone());
    let product_service = ProductService::new(db.clone());
    let order_service = OrderService::new(db.clone());

    rt.block_on(accounting_book_service.create_default_book())?;

    app.manage(accounting_service);
    app.manage(attachment_service);
    app.manage(accounting_book_service);
    app.manage(chat_service);
    app.manage(customer_service);
    app.manage(product_service);
    app.manage(order_service);

    Ok(())
}

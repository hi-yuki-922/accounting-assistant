pub mod accounting;
pub mod attachment;
pub mod accounting_book;
pub mod chat;

use sea_orm::DatabaseConnection;
use tauri::{App, Manager};
pub use accounting::AccountingService;
pub use accounting_book::AccountingBookService;
pub use attachment::AttachmentService;
pub use chat::ChatService;

// 服务模块通过 Tauri app.manage() 进行依赖注入
// 这里只提供服务类型的导出，具体的实例管理和生命周期由 Tauri 的 State 机制处理

pub fn init_services(app: &App,db: &DatabaseConnection, rt: &tokio::runtime::Runtime) -> Result<(), Box<dyn std::error::Error>> {

  let accounting_service = AccountingService::new(db.clone());
  let attachment_service = AttachmentService::new(db.clone());
  let accounting_book_service = AccountingBookService::new(db.clone());
  let chat_service = ChatService::new(db.clone());

  rt.block_on(accounting_book_service.create_default_book())?;

  app.manage(accounting_service);
  app.manage(attachment_service);
  app.manage(accounting_book_service);
  app.manage(chat_service);

  Ok(())
}

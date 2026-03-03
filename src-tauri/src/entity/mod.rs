pub mod accounting_record;
pub mod accounting_record_seq;
pub mod accounting_book;
pub mod accounting_book_seq;
pub mod attachment;
mod prelude;

pub async fn with_install_entities (db: &sea_orm::DatabaseConnection) -> Result<(), Box<dyn std::error::Error>> {
  db.get_schema_builder()
      .register(accounting_record::Entity)
      .register(accounting_record_seq::Entity)
      .register(accounting_book::Entity)
      .register(accounting_book_seq::Entity)
      .register(attachment::Entity)
      .sync(db)
      .await?;

  Ok(())
}

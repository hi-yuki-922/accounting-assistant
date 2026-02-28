pub mod accounting_record;
pub mod accounting_record_seq;
pub mod attachment;

pub async fn with_install_entities (db: &sea_orm::DatabaseConnection) -> Result<(), Box<dyn std::error::Error>> {
  db.get_schema_builder()
      .register(accounting_record::Entity)
      .register(accounting_record_seq::Entity)
      .register(attachment::Entity)
      .sync(db)
      .await?;

  Ok(())
}

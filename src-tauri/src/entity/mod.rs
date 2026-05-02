pub mod accounting_book;
pub mod accounting_book_seq;
pub mod accounting_record;
pub mod accounting_record_seq;
pub mod attachment;
pub mod category;
pub mod category_seq;
pub mod chat_message_seq;
pub mod chat_session;
pub mod customer;
pub mod customer_seq;
pub mod order;
pub mod order_item;
pub mod order_seq;
mod prelude;
pub mod product;
pub mod product_seq;
pub mod section_summary;

pub async fn with_install_entities(
    db: &sea_orm::DatabaseConnection,
) -> Result<(), Box<dyn std::error::Error>> {
    db.get_schema_builder()
        .register(accounting_record::Entity)
        .register(accounting_record_seq::Entity)
        .register(accounting_book::Entity)
        .register(accounting_book_seq::Entity)
        .register(attachment::Entity)
        .register(category::Entity)
        .register(category_seq::Entity)
        .register(chat_session::Entity)
        .register(chat_message_seq::Entity)
        .register(customer::Entity)
        .register(customer_seq::Entity)
        .register(product::Entity)
        .register(product_seq::Entity)
        .register(order::Entity)
        .register(order_item::Entity)
        .register(order_seq::Entity)
        .register(section_summary::Entity)
        .sync(db)
        .await?;

    Ok(())
}

mod accounting;
mod accounting_book;
mod attachment;
mod category;
mod chat;
mod customer;
mod order;
mod product;

pub fn with_install_tauri_commands(
    builder: tauri::Builder<tauri::Wry>,
) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        accounting::create_accounting_record,
        accounting::update_accounting_record,
        accounting::post_accounting_record,
        accounting::delete_accounting_record,
        accounting::batch_post_accounting_records,
        accounting::create_write_off_record,
        accounting::get_records_by_order_id,
        attachment::create_attachment,
        attachment::delete_attachment,
        attachment::delete_attachment_by_path,
        attachment::query_attachments,
        attachment::download_attachment,
        category::create_category,
        category::update_category,
        category::delete_category,
        category::get_all_categories,
        category::get_category_by_id,
        accounting_book::create_book,
        accounting_book::get_all_books,
        accounting_book::get_book_by_id,
        accounting_book::update_book,
        accounting_book::delete_book,
        accounting_book::get_records_by_book_id,
        accounting_book::get_uncategorized_records,
        accounting_book::get_books_paginated,
        accounting_book::get_records_by_book_id_paginated,
        accounting_book::get_write_off_records_by_id,
        accounting_book::get_record_write_off_details,
        chat::create_chat_session,
        chat::get_all_chat_sessions,
        chat::get_chat_session,
        chat::update_chat_session_title,
        chat::delete_chat_session,
        chat::create_chat_message,
        chat::get_chat_messages,
        chat::update_chat_message_state,
        chat::update_chat_message_content,
        customer::create_customer,
        customer::update_customer,
        customer::delete_customer,
        customer::get_all_customers,
        customer::get_customer_by_id,
        customer::search_customers,
        product::create_product,
        product::update_product,
        product::delete_product,
        product::get_all_products,
        product::get_product_by_id,
        product::search_products,
        order::create_order,
        order::settle_order,
        order::get_settle_preview,
        order::cancel_order,
        order::update_order,
        order::get_all_orders,
        order::get_order_by_id,
        order::get_orders_by_customer_id,
        order::get_orders_by_status,
        order::query_orders
    ])
}

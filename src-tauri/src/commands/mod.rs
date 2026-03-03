
mod demo;
mod accounting;
pub mod sidecar;
mod attachment;
mod config;
mod accounting_book;

pub fn with_install_tauri_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
  builder.invoke_handler(tauri::generate_handler![
    demo::greet,
    accounting::add_accounting_record,
    accounting::modify_accounting_record,
    accounting::post_accounting_record,
    sidecar::init_sidecar,
    sidecar::send_sidecar_command,
    sidecar::test_sidecar,
    config::get_llm_config,
    attachment::create_attachment,
    attachment::delete_attachment,
    attachment::delete_attachment_by_path,
    attachment::query_attachments,
    attachment::download_attachment,
    accounting_book::create_book,
    accounting_book::get_books,
    accounting_book::get_book_by_id,
    accounting_book::update_book_title,
    accounting_book::delete_book,
    accounting_book::get_records_by_book_id,
    accounting_book::get_uncategorized_records,
    accounting_book::get_books_paginated,
    accounting_book::get_records_by_book_id_paginated
  ])
}

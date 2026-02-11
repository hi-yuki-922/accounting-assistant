
mod demo;
mod accounting;

pub fn with_install_tauri_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
  builder.invoke_handler(tauri::generate_handler![
    demo::greet,
    accounting::add_accounting_record,
    accounting::modify_accounting_record,
    accounting::post_accounting_record
  ])
}

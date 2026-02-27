
mod demo;
mod accounting;
pub mod sidecar;
mod llm;

pub fn with_install_tauri_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
  builder.invoke_handler(tauri::generate_handler![
    demo::greet,
    accounting::add_accounting_record,
    accounting::modify_accounting_record,
    accounting::post_accounting_record,
    sidecar::init_sidecar,
    sidecar::send_sidecar_command,
    sidecar::test_sidecar,
    llm::chat_completion,
    llm::get_llm_config,
    llm::test_llm_connection
  ])
}

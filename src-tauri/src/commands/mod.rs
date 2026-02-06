
mod demo;

pub fn with_install_tauri_commands(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
  builder.invoke_handler(tauri::generate_handler![
    demo::greet
  ])
}

#[tauri::command]
pub async fn greet(name: String) -> Result<String, String> {
  Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

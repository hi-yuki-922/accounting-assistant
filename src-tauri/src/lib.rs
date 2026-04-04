use std::fs;
use tauri::Manager;
pub mod commands;
pub mod db;
pub mod entity;
pub mod enums;
pub mod services;
use crate::services::init_services;
use commands::with_install_tauri_commands;
use db::connection;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get app data directory path
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Ensure app data directory exists
            fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            let rt = tokio::runtime::Runtime::new().unwrap();

            // 初始化数据库连接池
            let db = rt.block_on(connection::init_db(&app_data_dir));
            let conn = db.unwrap();

            // 注册实体
            rt.block_on(entity::with_install_entities(conn.clone().as_ref()))
                .expect("Failed to register entities");

            // 初始服务
            init_services(app, conn.clone().as_ref(), &rt)?;

            app.manage(conn);
            Ok(())
        });

    builder = with_install_tauri_commands(builder);
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

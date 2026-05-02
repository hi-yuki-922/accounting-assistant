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
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 获取应用数据目录路径
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("获取应用数据目录失败");

            // 确保应用数据目录存在
            fs::create_dir_all(&app_data_dir).expect("创建应用数据目录失败");

            let rt = tokio::runtime::Runtime::new().unwrap();

            // 初始化数据库连接池
            let db = rt.block_on(connection::init_db(&app_data_dir));
            let conn = db.unwrap();

            // 注册实体
            rt.block_on(entity::with_install_entities(conn.clone().as_ref()))
                .expect("注册实体失败");

            // 初始服务
            init_services(app, conn.clone().as_ref(), &rt)?;

            app.manage(conn);
            Ok(())
        });

    builder = with_install_tauri_commands(builder);
    builder
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用失败");
}

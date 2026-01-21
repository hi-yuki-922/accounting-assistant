pub mod db;
use db::connection;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn greet(name: String) -> Result<String, String> {
    // Initialize database connection if not already done
    if connection::get_or_init_db().await.is_ok() {
        println!("Database connected successfully");
    } else {
        eprintln!("Failed to initialize database connection");
    }

    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize the database connection when app starts
            #[cfg(desktop)]
            {
                let _handle = app.handle().clone();
                std::thread::spawn(move || {
                    let rt = tokio::runtime::Runtime::new().unwrap();
                    rt.block_on(async move {
                        match connection::init_db().await {
                            Ok(_) => println!("Database initialized successfully"),
                            Err(e) => eprintln!("Failed to initialize database: {}", e),
                        }
                    });
                });
            }

            // For mobile platforms
            #[cfg(mobile)]
            {
                let _handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    match connection::init_db().await {
                        Ok(_) => println!("Database initialized successfully"),
                        Err(e) => eprintln!("Failed to initialize database: {}", e),
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

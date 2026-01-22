use std::fs;
pub mod db;
pub mod entity;
use db::connection;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn greet(name: String) -> Result<String, String> {
    // Check if database connection is available
    if connection::get_db().is_some() {
        println!("Database connected successfully");
    } else {
        eprintln!("Database not initialized yet");
    }

    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

// Function to register entities after database initialization
async fn register_entities(db: &sea_orm::DatabaseConnection) -> Result<(), Box<dyn std::error::Error>> {
    // In entity-first workflow, we might run migrations or perform other entity setup tasks here
    // For example, we could ensure tables exist, insert default data, etc.
    
    println!("Registering entities...");
    
    // Example: Ensure the tasks table exists by creating it if it doesn't exist
    // In a real entity-first workflow, this would typically run migrations
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get the app data directory path
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data directory");

            // Ensure the app data directory exists
            fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            // Initialize the database connection when app starts
            #[cfg(desktop)]
            {
                let _handle = app.handle().clone();
                std::thread::spawn(move || {
                    let rt = tokio::runtime::Runtime::new().unwrap();
                    rt.block_on(async move {
                        match connection::init_db(&app_data_dir).await {
                            Ok(db_connection) => {
                                println!("Database initialized successfully");
                                
                                // Register entities after database initialization in entity-first workflow
                                if let Err(e) = register_entities(&db_connection).await {
                                    eprintln!("Failed to register entities: {}", e);
                                } else {
                                    println!("Entities registered successfully");
                                }
                            },
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
                    match connection::init_db(&app_data_dir).await {
                        Ok(db_connection) => {
                            println!("Database initialized successfully");
                            
                            // Register entities after database initialization in entity-first workflow
                            if let Err(e) = register_entities(&db_connection).await {
                                eprintln!("Failed to register entities: {}", e);
                            } else {
                                println!("Entities registered successfully");
                            }
                        },
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
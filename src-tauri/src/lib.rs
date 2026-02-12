use std::fs;
use tauri::Manager;
pub mod db;
pub mod entity;
pub mod enums;
pub mod commands;
pub mod services;
pub mod sidecar;
use db::connection;
use commands::{with_install_tauri_commands, sidecar::SidecarState};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default()
      .plugin(tauri_plugin_opener::init())
      .setup(|app| {
        // Get the app data directory path
        let app_data_dir = app
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");

        // Ensure the app data directory exists
        fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

        // Initialize the sidecar client
        let sidecar_state: SidecarState = match SidecarState::new() {
            Ok(state) => {
                // Try to start the sidecar process
                match state.client().start() {
                    Ok(_) => {}
                    Err(e) => eprintln!("Warning: Failed to start sidecar process: {}", e),
                }
                state
            }
            Err(e) => {
                eprintln!("Warning: Failed to initialize sidecar client: {}", e);
                // Create a fallback state
                SidecarState::new().unwrap()
            }
        };

        app.manage(sidecar_state);

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
                  if let Err(e) = entity::with_install_entities(&db_connection).await {
                    eprintln!("Failed to register entities: {}", e);
                  } else {
                    println!("Entities registered successfully");
                  }
                }
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
                if let Err(e) = entity::with_install_entities(&db_connection).await {
                  eprintln!("Failed to register entities: {}", e);
                } else {
                  println!("Entities registered successfully");
                }
              }
              Err(e) => eprintln!("Failed to initialize database: {}", e),
            }
          });
        }

        Ok(())
      });

  builder = with_install_tauri_commands(builder);
  builder.run(tauri::generate_context!())
      .expect("error while running tauri application");

}

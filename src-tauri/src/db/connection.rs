use sea_orm::{Database, DatabaseConnection};
use std::sync::Arc;
use tokio::sync::OnceCell;
use std::path::Path;
use dirs;

// Global database connection instance
static DB_INSTANCE: OnceCell<Arc<DatabaseConnection>> = OnceCell::const_new();

/// Initialize the SQLite database connection with rwc mode (read-write-create)
/// Creates a connection pool to core.sqlite database file in the app data directory
pub async fn init_db(app_data_dir: &Path) -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    // Construct the database path in the app data directory
    let db_path = app_data_dir.join("core.sqlite");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_str().ok_or("Invalid database path")?);

    let db = Database::connect(&db_url).await?;

    // Store the connection in the global instance
    let db_arc = Arc::new(db);
    DB_INSTANCE.set(db_arc.clone()).map_err(|_| "Failed to set database instance")?;

    Ok(db_arc)
}

/// Get a reference to the global database connection
/// Returns None if the database hasn't been initialized yet
pub fn get_db() -> Option<Arc<DatabaseConnection>> {
    DB_INSTANCE.get().cloned()
}

use std::fs;

/// Get the database connection or initialize it if it hasn't been created yet
pub async fn get_or_init_db() -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    match DB_INSTANCE.get() {
        Some(conn) => Ok(conn.clone()),
        None => {
            // Initialize with a default path if called standalone
            // Try to get app data directory using standard directories
            let app_data_dir = dirs::data_dir()
                .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from(".")))
                .join("vibe-kanban");

            // Ensure the directory exists
            fs::create_dir_all(&app_data_dir).map_err(|e| format!("Failed to create app data directory: {}", e))?;

            init_db(&app_data_dir).await
        }
    }
}

use sea_orm::{Database, DatabaseConnection};
use std::sync::Arc;
use tokio::sync::OnceCell;

// Global database connection instance
static DB_INSTANCE: OnceCell<Arc<DatabaseConnection>> = OnceCell::const_new();

/// Initialize the SQLite database connection with rwc mode (read-write-create)
/// Creates a connection pool to core.sqlite database file
pub async fn init_db() -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    // Create SQLite connection with rwc mode (read-write-create)
    // This ensures the database file is created if it doesn't exist
    let db_url = "sqlite:core.sqlite?mode=rwc&auto_vacuum=full";

    let db = Database::connect(db_url).await?;

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

/// Get the database connection or initialize it if it hasn't been created yet
pub async fn get_or_init_db() -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    match DB_INSTANCE.get() {
        Some(conn) => Ok(conn.clone()),
        None => init_db().await,
    }
}
use sea_orm::{Database, DatabaseConnection};
use std::path::Path;
use std::sync::Arc;

/// Initialize the SQLite database connection with rwc mode (read-write-create)
/// Creates a connection to core.sqlite database file in the app data directory
pub async fn init_db(
    app_data_dir: &Path,
) -> Result<Arc<DatabaseConnection>, Box<dyn std::error::Error>> {
    // Construct the database path in the app data directory
    let db_path = app_data_dir.join("core.sqlite");
    let db_url = format!(
        "sqlite:{}?mode=rwc",
        db_path.to_str().ok_or("Invalid database path")?
    );

    let db = Database::connect(&db_url).await?;

    // Wrap in Arc for shared ownership
    let db_arc = Arc::new(db);

    Ok(db_arc)
}

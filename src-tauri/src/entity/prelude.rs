// Re-export commonly used sea-orm items along with generated entities
pub use sea_orm::prelude::*;
pub use sea_orm::{EntityTrait, ColumnTrait, RelationTrait};

// Export generated entities
// pub use super::generated::entity::*;
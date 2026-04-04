use crate::entity::attachment;
use serde::{Deserialize, Serialize};

/// 附件信息响应
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AttachmentInfo {
    pub id: i64,
    pub master_id: i64,
    pub path: String,
    pub file_name: String,
    pub file_suffix: String,
    pub file_size: String,
    pub create_at: String,
}

impl From<attachment::Model> for AttachmentInfo {
    fn from(model: attachment::Model) -> Self {
        Self {
            id: model.id,
            master_id: model.master_id,
            path: model.path,
            file_name: model.file_name,
            file_suffix: model.file_suffix,
            file_size: model.file_size,
            create_at: model.create_at.to_string(),
        }
    }
}

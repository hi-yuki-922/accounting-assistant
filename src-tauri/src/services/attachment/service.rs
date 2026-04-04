use std::path::Path;

use chrono::{DateTime, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};
use tauri::AppHandle;

use crate::entity::attachment;

use super::storage::AttachmentStorage;

/// 附件服务
#[derive(Debug)]
pub struct AttachmentService {
    db: DatabaseConnection,
}

impl AttachmentService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建附件
    pub async fn create_attachment(
        &self,
        app_handle: &AppHandle,
        master_id: i64,
        file_name: String,
        file_suffix: String,
        file_size: String,
        file_content: Vec<u8>,
    ) -> Result<(i64, String), Box<dyn std::error::Error>> {
        // 验证参数
        if master_id <= 0 {
            return Err("主表记录 ID 必须大于 0".into());
        }
        if file_name.is_empty() {
            return Err("文件名不能为空".into());
        }

        // 保存文件
        let storage_path =
            AttachmentStorage::save_file(app_handle, &file_name, file_content).await?;

        // 获取存储路径字符串
        let path_str = storage_path
            .to_str()
            .ok_or::<Box<dyn std::error::Error>>("存储路径转换为字符串失败".into())?
            .to_string();

        // 创建数据库记录
        let now = Utc::now().naive_utc();
        let attachment_model = attachment::ActiveModel {
            id: sea_orm::ActiveValue::NotSet,
            master_id: sea_orm::ActiveValue::Set(master_id),
            path: sea_orm::ActiveValue::Set(path_str.clone()),
            file_name: sea_orm::ActiveValue::Set(file_name.clone()),
            file_suffix: sea_orm::ActiveValue::Set(file_suffix),
            file_size: sea_orm::ActiveValue::Set(file_size),
            create_at: sea_orm::ActiveValue::Set(now),
        };

        let result = attachment_model.insert(&self.db).await?;

        Ok((result.id, path_str))
    }

    /// 按 ID 删除附件
    pub async fn delete_attachment(&self, id: i64) -> Result<(), Box<dyn std::error::Error>> {
        // 查找附件
        let attachment = attachment::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or::<Box<dyn std::error::Error>>("附件不存在".into())?;

        // 删除物理文件
        if Path::new(&attachment.path).exists() {
            AttachmentStorage::delete_file(&attachment.path).await?;
        }

        // 删除数据库记录
        attachment::Entity::delete_by_id(id).exec(&self.db).await?;

        Ok(())
    }

    /// 按路径删除附件
    pub async fn delete_attachment_by_path(
        &self,
        path: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        // 查找附件
        let attachment = attachment::Entity::find()
            .filter(attachment::Column::Path.eq(path))
            .one(&self.db)
            .await?
            .ok_or::<Box<dyn std::error::Error>>("附件不存在".into())?;

        // 删除物理文件
        if Path::new(path).exists() {
            AttachmentStorage::delete_file(path).await?;
        }

        // 删除数据库记录
        attachment::Entity::delete_by_id(attachment.id)
            .exec(&self.db)
            .await?;

        Ok(())
    }

    /// 查询附件列表(支持分页和筛选)
    pub async fn query_attachments(
        &self,
        page: i64,
        page_size: i64,
        file_name: Option<String>,
        file_suffix: Option<String>,
        start_time: Option<DateTime<Utc>>,
        end_time: Option<DateTime<Utc>>,
        master_id: Option<i64>,
    ) -> Result<Vec<attachment::Model>, Box<dyn std::error::Error>> {
        // 验证分页参数
        if page < 1 {
            return Err("页码必须大于 0".into());
        }
        if page_size <= 0 {
            return Err("每页数量必须大于 0".into());
        }

        let mut query = attachment::Entity::find();

        // 按文件名筛选
        if let Some(name) = file_name {
            if !name.is_empty() {
                query = query.filter(attachment::Column::FileName.contains(&name));
            }
        }

        // 按文件后缀筛选
        if let Some(suffix) = file_suffix {
            if !suffix.is_empty() {
                query = query.filter(attachment::Column::FileSuffix.eq(&suffix));
            }
        }

        // 按时间范围筛选
        if let Some(start) = start_time {
            let start_naive = start.naive_utc();
            query = query.filter(attachment::Column::CreateAt.gte(start_naive));
        }
        if let Some(end) = end_time {
            let end_naive = end.naive_utc();
            query = query.filter(attachment::Column::CreateAt.lte(end_naive));
        }

        // 按 master_id 筛选
        if let Some(mid) = master_id {
            if mid > 0 {
                query = query.filter(attachment::Column::MasterId.eq(mid));
            }
        }

        // 按创建时间倒序排列
        query = query.order_by_desc(attachment::Column::CreateAt);

        // 分页
        let offset = (page - 1) * page_size;
        query = query.limit(page_size as u64).offset(offset as u64);

        let result = query.all(&self.db).await?;

        Ok(result)
    }

    /// 下载附件
    pub async fn download_attachment(
        &self,
        id: i64,
    ) -> Result<(String, Vec<u8>), Box<dyn std::error::Error>> {
        // 查找附件
        let attachment = attachment::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or::<Box<dyn std::error::Error>>("附件不存在".into())?;

        // 读取文件
        let file_content = AttachmentStorage::read_file(&attachment.path).await?;

        Ok((attachment.file_name, file_content))
    }
}

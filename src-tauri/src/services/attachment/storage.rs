use chrono::{Local, Utc};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use tokio::fs;

/// 附件存储管理器
#[derive(Debug)]
pub struct AttachmentStorage {
}

impl AttachmentStorage {

    /// 获取 app_data_dir 路径
    fn get_app_data_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
        Ok(app_handle.path().app_data_dir().expect("Failed to get app data directory"))
    }

    /// 获取基础存储目录
    pub fn get_base_storage_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
        let app_data_dir = Self::get_app_data_dir(app_handle)?;
        let storage_dir = app_data_dir.join("fileStorage").join("attachment");
        Ok(storage_dir)
    }

    /// 获取月度目录路径 [YYYY-MM]
    pub fn get_monthly_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
        let now = Local::now();
        let year_month = now.format("%Y-%m").to_string();
        let base_dir = Self::get_base_storage_dir(app_handle)?;
        Ok(base_dir.join(year_month))
    }

    /// 生成带时间戳前缀的文件名
    pub fn generate_filename(original_filename: &str) -> String {
        let timestamp = Utc::now().timestamp_millis();
        format!("{}-{}", timestamp, original_filename)
    }

    /// 生成完整的存储路径
    pub async fn generate_storage_path(app_handle: &AppHandle, original_filename: &str) -> Result<PathBuf, String> {
        let monthly_dir = Self::get_monthly_dir(app_handle)?;
        let filename = Self::generate_filename(original_filename);
        Ok(monthly_dir.join(filename))
    }

    /// 创建存储目录(如果不存在)
    pub async fn ensure_storage_dir(app_handle: &AppHandle) -> Result<(), String> {
        let monthly_dir = Self::get_monthly_dir(app_handle)?;
        fs::create_dir_all(&monthly_dir)
            .await
            .map_err(|e| format!("创建存储目录失败: {}", e))?;
        Ok(())
    }

    /// 保存文件到存储目录
    pub async fn save_file(app_handle: &AppHandle, filename: &str, content: Vec<u8>) -> Result<PathBuf, String> {
        // 确保存储目录存在
        Self::ensure_storage_dir(app_handle).await?;

        // 生成存储路径
        let storage_path = Self::generate_storage_path(app_handle, filename).await?;

        // 写入文件
        fs::write(&storage_path, content)
            .await
            .map_err(|e| format!("写入文件失败: {}", e))?;

        Ok(storage_path)
    }

    /// 根据路径删除文件
    pub async fn delete_file(path: &str) -> Result<(), String> {
        fs::remove_file(path)
            .await
            .map_err(|e| format!("删除文件失败: {}", e))?;
        Ok(())
    }

    /// 读取文件内容
    pub async fn read_file(path: &str) -> Result<Vec<u8>, String> {
        fs::read(path)
            .await
            .map_err(|e| format!("读取文件失败: {}", e))
    }
}

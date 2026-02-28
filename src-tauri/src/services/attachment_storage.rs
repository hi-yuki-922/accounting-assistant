use chrono::{Local, Utc};
use std::path::PathBuf;
use tauri::AppHandle;
use tokio::fs;
use dirs;

/// 附件存储管理器
pub struct AttachmentStorage {
    _app_handle: AppHandle,
}

impl AttachmentStorage {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { _app_handle: app_handle }
    }

    /// 获取 app_data_dir 路径
    fn get_app_data_dir(&self) -> Result<PathBuf, String> {
        dirs::data_dir()
            .ok_or("无法获取数据目录")?
            .join("accounting-assistant")
    }

    /// 获取基础存储目录
    pub fn get_base_storage_dir(&self) -> Result<PathBuf, String> {
        let app_data_dir = self.get_app_data_dir()?;
        let storage_dir = app_data_dir.join("fileStorage").join("attachment");
        Ok(storage_dir)
    }

    /// 获取月度目录路径 [YYYY-MM]
    pub fn get_monthly_dir(&self) -> Result<PathBuf, String> {
        let now = Local::now();
        let year_month = now.format("%Y-%m").to_string();
        let base_dir = self.get_base_storage_dir()?;
        Ok(base_dir.join(year_month))
    }

    /// 生成带时间戳前缀的文件名
    pub fn generate_filename(&self, original_filename: &str) -> String {
        let timestamp = Utc::now().timestamp_millis();
        format!("{}-{}", timestamp, original_filename)
    }

    /// 生成完整的存储路径
    pub async fn generate_storage_path(&self, original_filename: &str) -> Result<PathBuf, String> {
        let monthly_dir = self.get_monthly_dir()?;
        let filename = self.generate_filename(original_filename);
        Ok(monthly_dir.join(filename))
    }

    /// 创建存储目录(如果不存在)
    pub async fn ensure_storage_dir(&self) -> Result<(), String> {
        let monthly_dir = self.get_monthly_dir()?;
        fs::create_dir_all(&monthly_dir)
            .await
            .map_err(|e| format!("创建存储目录失败: {}", e))?;
        Ok(())
    }

    /// 保存文件到存储目录
    pub async fn save_file(&self, filename: &str, content: Vec<u8>) -> Result<PathBuf, String> {
        // 确保存储目录存在
        self.ensure_storage_dir().await?;

        // 生成存储路径
        let storage_path = self.generate_storage_path(filename).await?;

        // 写入文件
        fs::write(&storage_path, content)
            .await
            .map_err(|e| format!("写入文件失败: {}", e))?;

        Ok(storage_path)
    }

    /// 根据路径删除文件
    pub async fn delete_file(&self, path: &str) -> Result<(), String> {
        fs::remove_file(path)
            .await
            .map_err(|e| format!("删除文件失败: {}", e))?;
        Ok(())
    }

    /// 读取文件内容
    pub async fn read_file(&self, path: &str) -> Result<Vec<u8>, String> {
        fs::read(path)
            .await
            .map_err(|e| format!("读取文件失败: {}", e))
    }
}

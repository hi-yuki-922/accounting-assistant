use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DeleteResult, EntityTrait, QueryFilter,
    QueryOrder, Set,
};

use crate::entity::{
    chat_session::{self, ActiveModel as SessionActiveModel, Model as SessionModel},
    section_summary::{self, ActiveModel as SummaryActiveModel, Model as SummaryModel},
};

use super::dto::CreateSessionDto;

/// 聊天服务
#[derive(Debug, Clone)]
pub struct ChatService {
    db: DatabaseConnection,
}

impl ChatService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建新会话
    pub async fn create_session(
        &self,
        input: CreateSessionDto,
    ) -> Result<SessionModel, Box<dyn std::error::Error>> {
        let id = SessionModel::generate_id(&self.db).await?;

        let new_session = SessionActiveModel {
            id: Set(id),
            title: Set(input.title),
            created_at: Set(chrono::Local::now().naive_local()),
            updated_at: Set(chrono::Local::now().naive_local()),
        };

        let inserted_session = new_session.insert(&self.db).await?;
        Ok(inserted_session)
    }

    /// 获取所有会话，按创建时间倒序排列
    pub async fn get_all_sessions(&self) -> Result<Vec<SessionModel>, Box<dyn std::error::Error>> {
        let sessions = chat_session::Entity::find()
            .order_by_desc(chat_session::Column::CreatedAt)
            .all(&self.db)
            .await?;
        Ok(sessions)
    }

    /// 根据 ID 获取会话
    pub async fn get_session_by_id(
        &self,
        id: i64,
    ) -> Result<Option<SessionModel>, Box<dyn std::error::Error>> {
        let session = chat_session::Entity::find_by_id(id).one(&self.db).await?;
        Ok(session)
    }

    /// 更新会话标题
    pub async fn update_session_title(
        &self,
        id: i64,
        title: String,
    ) -> Result<SessionModel, Box<dyn std::error::Error>> {
        let session = chat_session::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("会话不存在")?;

        let mut active_model: SessionActiveModel = session.into();
        active_model.title = Set(title);
        active_model.updated_at = Set(chrono::Local::now().naive_local());

        let updated_session = active_model.update(&self.db).await?;
        Ok(updated_session)
    }

    /// 删除会话（级联删除该会话的所有节摘要）
    pub async fn delete_session(
        &self,
        id: i64,
    ) -> Result<DeleteResult, Box<dyn std::error::Error>> {
        // 先删除该会话的所有节摘要
        let _ = section_summary::Entity::delete_many()
            .filter(section_summary::Column::SessionId.eq(id))
            .exec(&self.db)
            .await?;

        // 再删除会话
        let result = chat_session::Entity::delete_by_id(id)
            .exec(&self.db)
            .await?;
        Ok(result)
    }

    /// 创建或更新节摘要（同一 session_id + section_file 只保留一条）
    pub async fn create_section_summary(
        &self,
        session_id: i64,
        section_file: String,
        title: Option<String>,
        summary: String,
    ) -> Result<SummaryModel, Box<dyn std::error::Error>> {
        // 查找是否已存在同一 (session_id, section_file) 的摘要
        let existing = section_summary::Entity::find()
            .filter(section_summary::Column::SessionId.eq(session_id))
            .filter(section_summary::Column::SectionFile.eq(&section_file))
            .one(&self.db)
            .await?;

        if let Some(model) = existing {
            // 已存在，更新摘要内容和标题
            let mut active_model: SummaryActiveModel = model.into();
            active_model.title = Set(title);
            active_model.summary = Set(summary);
            let updated = active_model.update(&self.db).await?;
            Ok(updated)
        } else {
            // 不存在，新建
            let id = SummaryModel::generate_id(&self.db).await?;

            let new_summary = SummaryActiveModel {
                id: Set(id),
                session_id: Set(session_id),
                section_file: Set(section_file),
                title: Set(title),
                summary: Set(summary),
                created_at: Set(chrono::Local::now().naive_local()),
            };

            let inserted = new_summary.insert(&self.db).await?;
            Ok(inserted)
        }
    }

    /// 获取指定会话的所有节摘要，按创建时间正序
    pub async fn get_summaries_by_session(
        &self,
        session_id: i64,
    ) -> Result<Vec<SummaryModel>, Box<dyn std::error::Error>> {
        let summaries = section_summary::Entity::find()
            .filter(section_summary::Column::SessionId.eq(session_id))
            .order_by_asc(section_summary::Column::CreatedAt)
            .all(&self.db)
            .await?;
        Ok(summaries)
    }
}

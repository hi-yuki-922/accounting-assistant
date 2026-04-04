use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DeleteResult, EntityTrait, QueryFilter,
    QueryOrder, Set,
};

use crate::entity::{
    chat_message::{self, ActiveModel as MessageActiveModel, Model as MessageModel},
    chat_session::{self, ActiveModel as SessionActiveModel, Model as SessionModel},
};
use crate::enums::MessageState;

use super::dto::{CreateMessageDto, CreateSessionDto};

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
            model: Set(input.model.unwrap_or_else(|| "glm-4-plus".to_string())),
            system_prompt: Set(input.system_prompt),
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

    /// 删除会话（级联删除该会话的所有消息）
    pub async fn delete_session(
        &self,
        id: i64,
    ) -> Result<DeleteResult, Box<dyn std::error::Error>> {
        // 先删除该会话的所有消息
        let _ = chat_message::Entity::delete_many()
            .filter(chat_message::Column::SessionId.eq(id))
            .exec(&self.db)
            .await?;

        // 再删除会话
        let result = chat_session::Entity::delete_by_id(id)
            .exec(&self.db)
            .await?;
        Ok(result)
    }

    /// 创建消息
    pub async fn create_message(
        &self,
        input: CreateMessageDto,
    ) -> Result<MessageModel, Box<dyn std::error::Error>> {
        let id = MessageModel::generate_id(&self.db).await?;

        let new_message = MessageActiveModel {
            id: Set(id),
            session_id: Set(input.session_id),
            role: Set(input.role),
            content: Set(input.content),
            tokens: Set(input.tokens),
            created_at: Set(chrono::Local::now().naive_local()),
            state: Set(input.state.unwrap_or(MessageState::Sending)),
        };

        let inserted_message = new_message.insert(&self.db).await?;
        Ok(inserted_message)
    }

    /// 获取会话的所有消息，按创建时间正序排列
    pub async fn get_messages_by_session(
        &self,
        session_id: i64,
    ) -> Result<Vec<MessageModel>, Box<dyn std::error::Error>> {
        let messages = chat_message::Entity::find()
            .filter(chat_message::Column::SessionId.eq(session_id))
            .order_by_asc(chat_message::Column::CreatedAt)
            .all(&self.db)
            .await?;
        Ok(messages)
    }

    /// 更新消息状态
    pub async fn update_message_state(
        &self,
        id: i64,
        state: MessageState,
    ) -> Result<MessageModel, Box<dyn std::error::Error>> {
        let message = chat_message::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("消息不存在")?;

        let mut active_model: MessageActiveModel = message.into();
        active_model.state = Set(state);

        let updated_message = active_model.update(&self.db).await?;
        Ok(updated_message)
    }

    /// 更新消息内容和 Token 数量
    pub async fn update_message_content(
        &self,
        id: i64,
        content: String,
        tokens: Option<i32>,
    ) -> Result<MessageModel, Box<dyn std::error::Error>> {
        let message = chat_message::Entity::find_by_id(id)
            .one(&self.db)
            .await?
            .ok_or("消息不存在")?;

        let mut active_model: MessageActiveModel = message.into();
        active_model.content = Set(content);
        active_model.tokens = Set(tokens);
        active_model.state = Set(MessageState::Completed);

        let updated_message = active_model.update(&self.db).await?;
        Ok(updated_message)
    }
}

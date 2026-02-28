## ADDED Requirements

### Requirement: Attachment entity definition
系统 MUST 定义附件实体 Attachment,用于存储附件元数据信息。

#### Scenario: Attachment entity fields
- **WHEN** 定义 Attachment 实体
- **THEN** 实体 MUST 包含以下字段:
  - `id`: i64 类型,主键,自增
  - `master_id`: i64 类型,主表记录 ID
  - `path`: String 类型,文件存储路径
  - `file_name`: String 类型,文件原始名称
  - `file_suffix`: String 类型,文件后缀名(如 "jpg", "pdf")
  - `file_size`: String 类型,文件体积(如 "1024 KB")
  - `create_at`: NativeDateTime 类型,创建时间戳

#### Scenario: Attachment entity registration
- **WHEN** 应用初始化数据库
- **THEN** Attachment 实体 MUST 被注册到 Sea-ORM
- **THEN** 数据库 MUST 自动创建 attachment 表
- **THEN** 表结构 MUST 与实体定义一致

#### Scenario: Auto-increment primary key
- **WHEN** 插入新的附件记录
- **THEN** id 字段 MUST 自动递增
- **THEN** 数据库 MUST 生成唯一的 ID 值

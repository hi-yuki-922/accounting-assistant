## ADDED Requirements

### Requirement: Attachment storage location
系统 MUST 在 Tauri app_data_dir 目录下创建文件存储结构。

#### Scenario: Base storage directory creation
- **WHEN** 系统初始化附件存储
- **THEN** 系统必须在 app_data_dir 下创建 `fileStorage/attachment/` 目录
- **THEN** 如果目录已存在 MUST 不报错

#### Scenario: Monthly directory structure
- **WHEN** 存储附件文件
- **THEN** 文件 MUST 存储在 `fileStorage/attachment/[YYYY-MM]/` 目录下
- **THEN** YYYY-MM MUST 为文件创建时间的年月格式
- **THEN** 月度目录不存在时 MUST 自动创建

#### Scenario: File naming convention
- **WHEN** 存储附件文件
- **THEN** 文件名 MUST 格式为 `[timestamp]-filename`
- **THEN** timestamp MUST 为毫秒级时间戳
- **THEN** filename MUST 为文件原始名称
- **THEN** 示例: `1740412800000-invoice.jpg`

### Requirement: Attachment path generation
系统 MUST 提供附件存储路径生成功能。

#### Scenario: Generate storage path for new attachment
- **WHEN** 调用路径生成函数
- **WHEN** 提供原始文件名
- **THEN** 系统 MUST 返回完整的存储路径
- **THEN** 路径 MUST 包含 app_data_dir、年月目录、时间戳前缀和原始文件名

#### Scenario: Path uniqueness guarantee
- **WHEN** 同一分钟内上传同名文件
- **THEN** 系统 MUST 使用不同毫秒时间戳避免冲突
- **THEN** 文件 MUST 不会互相覆盖

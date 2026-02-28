## ADDED Requirements

### Requirement: Create attachment
系统 MUST 提供创建附件功能,将文件保存到存储目录并记录元数据。

#### Scenario: Successfully create attachment
- **WHEN** 调用创建附件服务
- **WHEN** 提供主表 ID、文件名、文件后缀、文件大小和文件内容
- **THEN** 系统 MUST 将文件保存到存储目录
- **THEN** 系统 MUST 在数据库创建附件记录
- **THEN** 系统 MUST 返回附件完整路径和 ID
- **THEN** 存储路径 MUST 符合按月归档规则

#### Scenario: Create attachment with invalid master_id
- **WHEN** 调用创建附件服务
- **WHEN** 提供无效的主表 ID(如 0 或负数)
- **THEN** 系统 MUST 返回错误
- **THEN** 系统 MUST 不创建任何文件或记录

#### Scenario: Create attachment fails on file save error
- **WHEN** 调用创建附件服务
- **WHEN** 文件保存失败(如磁盘空间不足)
- **THEN** 系统 MUST 返回错误信息
- **THEN** 系统 MUST 不在数据库创建记录
- **THEN** 系统 MUST 不创建部分文件

### Requirement: Delete attachment
系统 MUST 提供删除附件功能,同时删除数据库记录和物理文件。

#### Scenario: Successfully delete attachment
- **WHEN** 调用删除附件服务
- **WHEN** 提供有效的附件 ID
- **THEN** 系统 MUST 删除数据库中的附件记录
- **THEN** 系统 MUST 删除物理文件
- **THEN** 系统 MUST 返回成功确认

#### Scenario: Delete attachment by path
- **WHEN** 调用按路径删除附件服务
- **WHEN** 提供有效的附件路径
- **THEN** 系统 MUST 根据路径查找附件记录
- **THEN** 系统 MUST 删除数据库记录
- **THEN** 系统 MUST 删除物理文件
- **THEN** 系统 MUST 返回成功确认

#### Scenario: Delete non-existent attachment
- **WHEN** 调用删除附件服务
- **WHEN** 提供不存在的附件 ID
- **THEN** 系统 MUST 返回错误信息
- **THEN** 系统 MUST 不抛出异常

#### Scenario: Delete attachment with missing file
- **WHEN** 调用删除附件服务
- **WHEN** 附件记录存在但物理文件已缺失
- **THEN** 系统 MUST 删除数据库记录
- **THEN** 系统 MUST 返回成功(仅删除记录)

### Requirement: Query attachment list with pagination
系统 MUST 提供分页查询附件列表功能。

#### Scenario: Query all attachments with pagination
- **WHEN** 调用查询附件列表服务
- **WHEN** 提供页码和每页数量
- **THEN** 系统 MUST 返回指定页的附件列表
- **THEN** 结果 MUST 包含附件 ID、路径、文件名、后缀、大小、创建时间
- **THEN** 结果 MUST 按创建时间倒序排列

#### Scenario: Query attachments filtered by file name
- **WHEN** 调用查询附件列表服务
- **WHEN** 提供文件名称关键词
- **THEN** 系统 MUST 返回文件名包含关键词的附件
- **THEN** 筛选 MUST 不区分大小写
- **THEN** 分页 MUST 在筛选结果上进行

#### Scenario: Query attachments filtered by file suffix
- **WHEN** 调用查询附件列表服务
- **WHEN** 提供文件后缀(如 "jpg", "pdf")
- **THEN** 系统 MUST 返回指定后缀的附件
- **THEN** 后缀匹配 MUST 不区分大小写
- **THEN** 分页 MUST 在筛选结果上进行

#### Scenario: Query attachments filtered by date range
- **WHEN** 调用查询附件列表服务
- **WHEN** 提供开始时间和结束时间
- **THEN** 系统 MUST 返回创建时间在范围内的附件
- **THEN** 时间范围 MUST 包含边界值
- **THEN** 分页 MUST 在筛选结果上进行

#### Scenario: Query attachments with combined filters
- **WHEN** 调用查询附件列表服务
- **WHEN** 同时提供文件名、后缀、时间范围多个筛选条件
- **THEN** 系统 MUST 返回同时满足所有条件的附件
- **THEN** 筛选条件 MUST 使用 AND 逻辑组合
- **THEN** 分页 MUST 在筛选结果上进行

#### Scenario: Query attachments for specific master record
- **WHEN** 调用查询附件列表服务
- **WHEN** 提供主表记录 ID
- **THEN** 系统 MUST 返回该主记录关联的所有附件
- **THEN** 结果 MUST 仅包含指定 master_id 的附件

### Requirement: Download attachment
系统 MUST 提供附件下载功能。

#### Scenario: Successfully download attachment
- **WHEN** 调用下载附件服务
- **WHEN** 提供有效的附件 ID
- **THEN** 系统 MUST 读取物理文件内容
- **THEN** 系统 MUST 返回文件字节数组
- **THEN** 系统 MUST 返回文件名和 MIME 类型

#### Scenario: Download non-existent attachment
- **WHEN** 调用下载附件服务
- **WHEN** 提供不存在的附件 ID
- **THEN** 系统 MUST 返回错误信息
- **THEN** 系统 MUST 不抛出异常

#### Scenario: Download attachment with missing file
- **WHEN** 调用下载附件服务
- **WHEN** 数据库记录存在但物理文件缺失
- **THEN** 系统 MUST 返回错误信息
- **THEN** 错误信息 MUST 指出文件不存在

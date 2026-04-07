## ADDED Requirements

### Requirement: 创建客户
系统 SHALL 提供创建客户的功能。必须传入 name、category、phone 字段，可选传入 wechat、address、bank_account、remark 字段。

#### Scenario: 创建客户成功
- **WHEN** 传入必填字段 name="张三", category="Retailer", phone="13800138000"
- **THEN** 系统生成唯一 ID，创建客户记录并返回完整的客户数据

#### Scenario: 创建客户含可选字段
- **WHEN** 传入 name="李四", category="Supplier", phone="13900139000", wechat="lisi_wx", address="某地址", bank_account="6222000000", remark="长期合作"
- **THEN** 系统创建包含所有字段的客户记录

### Requirement: 修改客户
系统 SHALL 提供修改已有客户信息的功能。通过客户 ID 定位记录，仅更新传入的非空字段。

#### Scenario: 修改客户部分字段
- **WHEN** 传入客户 ID 和 phone="13800138001"（仅更新电话）
- **THEN** 系统仅更新 phone 字段，其他字段保持不变

#### Scenario: 修改不存在的客户
- **WHEN** 传入不存在的客户 ID
- **THEN** 系统返回错误提示"客户不存在"

### Requirement: 删除客户
系统 SHALL 提供删除客户的功能。通过客户 ID 删除对应记录。

#### Scenario: 删除客户成功
- **WHEN** 传入存在的客户 ID
- **THEN** 系统删除该客户记录

#### Scenario: 删除不存在的客户
- **WHEN** 传入不存在的客户 ID
- **THEN** 系统返回错误提示"客户不存在"

### Requirement: 查询全部客户
系统 SHALL 提供查询全部客户列表的功能，按创建时间倒序排列。

#### Scenario: 查询全部客户
- **WHEN** 调用获取全部客户接口
- **THEN** 返回所有客户记录，按创建时间从新到旧排列

#### Scenario: 无客户数据
- **WHEN** 数据库中无任何客户记录
- **THEN** 返回空列表

### Requirement: 按 ID 查询客户
系统 SHALL 提供按客户 ID 查询单个客户的功能。

#### Scenario: 查询存在的客户
- **WHEN** 传入存在的客户 ID
- **THEN** 返回该客户的完整信息

#### Scenario: 查询不存在的客户
- **WHEN** 传入不存在的客户 ID
- **THEN** 返回错误提示"客户不存在"

### Requirement: 搜索客户
系统 SHALL 提供按姓名或电话号码模糊搜索客户的功能。

#### Scenario: 按姓名搜索
- **WHEN** 搜索关键词为"张"
- **THEN** 返回所有姓名中包含"张"的客户

#### Scenario: 按电话搜索
- **WHEN** 搜索关键词为"138"
- **THEN** 返回所有电话号码中包含"138"的客户

#### Scenario: 无匹配结果
- **WHEN** 搜索关键词无匹配客户
- **THEN** 返回空列表

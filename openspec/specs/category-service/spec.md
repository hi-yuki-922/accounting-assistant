# 品类服务（category-service）

## Purpose

提供品类管理的业务逻辑层，包括品类的创建、更新、删除以及多维度查询功能，同时注册品类相关的 IPC 命令。

## Requirements

### Requirement: 创建品类
系统 SHALL 提供创建品类的能力，接受 name（必填）、sell_book_id（必填）、purchase_book_id（必填）、remark（可选）作为输入。品类名称 MUST 唯一。

#### Scenario: 成功创建品类
- **WHEN** 用户提供有效的名称、销售账本 ID 和进货账本 ID
- **THEN** 系统创建品类记录并返回完整品类数据

#### Scenario: 品类名称重复
- **WHEN** 用户创建品类时使用的名称已存在
- **THEN** 系统拒绝创建并返回错误提示

#### Scenario: 关联账本不存在
- **WHEN** 用户提供的 sell_book_id 或 purchase_book_id 对应的账本不存在
- **THEN** 系统拒绝创建并返回错误提示

### Requirement: 更新品类
系统 SHALL 提供更新品类的能力，允许修改名称、sell_book_id、purchase_book_id 和 remark。更新后名称仍 MUST 唯一。

#### Scenario: 成功更新品类
- **WHEN** 用户提供品类 ID 和有效的更新字段
- **THEN** 系统更新品类记录并返回更新后的数据

#### Scenario: 更新为已存在的名称
- **WHEN** 用户将品类名称更新为其他品类已使用的名称
- **THEN** 系统拒绝更新并返回错误提示

#### Scenario: 默认品类不可修改名称
- **WHEN** 用户尝试修改"未分类"品类的名称
- **THEN** 系统拒绝修改，"未分类"品类的名称 MUST 保持不变

### Requirement: 删除品类
系统 SHALL 提供删除品类的能力。若品类下存在关联商品，MUST 拒绝删除。"未分类"品类 MUST 不可删除。

#### Scenario: 成功删除品类
- **WHEN** 用户删除一个没有关联商品的品类（非"未分类"）
- **THEN** 系统删除该品类记录

#### Scenario: 存在关联商品时拒绝删除
- **WHEN** 用户删除一个仍有关联商品的品类
- **THEN** 系统拒绝删除并返回错误提示

#### Scenario: 拒绝删除默认品类
- **WHEN** 用户尝试删除"未分类"品类
- **THEN** 系统拒绝删除

### Requirement: 查询所有品类
系统 SHALL 提供查询所有品类的能力，按创建时间升序排列，"未分类"品类始终排在首位。

#### Scenario: 获取品类列表
- **WHEN** 用户查询所有品类
- **THEN** 系统返回品类列表，"未分类"排在第一位，其余按创建时间升序

### Requirement: 根据 ID 查询品类
系统 SHALL 提供根据 ID 查询单个品类的能力。

#### Scenario: 品类存在
- **WHEN** 用户查询存在的品类 ID
- **THEN** 系统返回对应的品类数据

#### Scenario: 品类不存在
- **WHEN** 用户查询不存在的品类 ID
- **THEN** 系统返回错误提示"品类不存在"

### Requirement: 品类服务 IPC 命令注册
系统 SHALL 在命令层注册品类相关的 IPC 命令，包括创建、更新、删除、查询所有、根据 ID 查询。

#### Scenario: IPC 命令注册
- **WHEN** 系统启动
- **THEN** 注册品类相关的 Tauri IPC 命令，前端可通过 invoke 调用

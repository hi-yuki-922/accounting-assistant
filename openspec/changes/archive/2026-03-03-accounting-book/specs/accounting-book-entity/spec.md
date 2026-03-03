## ADDED Requirements

### Requirement: AccountingBook 实体定义
系统 SHALL 定义 AccountingBook 实体，包含以下字段：
- `id`: i64 类型，主键，非自增
- `title`: String 类型，账本标题
- `create_at`: NaiveDateTime 类型，创建时间

#### Scenario: 实体结构验证
- **WHEN** 定义 AccountingBook 实体
- **THEN** 实体包含 id、title、create_at 三个字段
- **AND** id 为主键且不自增
- **AND** title 为 String 类型
- **AND** create_at 为 NaiveDateTime 类型

### Requirement: 默认账本初始化
系统 SHALL 在数据库初始化后创建默认账本，id 固定为 10000001，title 为"未归类账目"，创建时间为 2000-01-01 00:00:00。

#### Scenario: 首次数据库初始化
- **WHEN** 系统首次初始化数据库
- **THEN** 在数据库中插入 id=10000001 的默认账本
- **AND** title 字段值为"未归类账目"
- **AND** create_at 字段值为 2000-01-01 00:00:00

#### Scenario: 重复初始化处理
- **WHEN** 系统检测到默认账本已存在
- **THEN** 不重复插入默认账本
- **AND** 数据库中仅存在一条 id=10000001 的记录

### Requirement: 账本 ID 生成规则
系统 SHALL 使用 yyyyxxxx 格式生成普通账本 ID，其中 yyyy 为当前年份（4位），xxxx 为四位流水号（从 0001 开始）。

#### Scenario: 2025年第一个账本
- **WHEN** 用户在 2025 年创建第一个账本
- **THEN** 账本 ID 为 20250001

#### Scenario: 同年多个账本
- **WHEN** 用户在 2025 年创建第三个账本
- **THEN** 账本 ID 为 20250003
- **AND** 流水号按创建顺序递增

#### Scenario: 跨年账本
- **WHEN** 用户在 2026 年创建第一个账本
- **THEN** 账本 ID 为 20260001
- **AND** 流水号从 0001 重新开始

### Requirement: 账本序列表管理
系统 SHALL 创建 accounting_book_seq 表用于管理账本流水号，包含 id（年份）和 seq（当前流水号）两个字段。

#### Scenario: 序列表结构
- **WHEN** 创建 accounting_book_seq 表
- **THEN** id 字段存储年份（格式为 yyyy）
- **AND** seq 字段存储当前流水号
- **AND** id 字段为主键

#### Scenario: 流水号递增
- **WHEN** 用户创建同年的新账本
- **THEN** accounting_book_seq 表中对应年份的 seq 值递增
- **AND** 新账本使用递增后的 seq 值

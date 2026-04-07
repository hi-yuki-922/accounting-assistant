## ADDED Requirements

### Requirement: 记账记录支持订单关联
系统 SHALL 在 `accounting_record` 实体中新增 `order_id: Option<i64>` 字段，支持记账记录与订单的双向关联。

#### Scenario: 创建带订单 ID 的记账记录
- **WHEN** 订单结账时创建记账记录
- **THEN** accounting_record.order_id 为对应订单的 ID
- **THEN** accounting_record 其余字段按现有规则填充

#### Scenario: 手动创建记账记录无订单关联
- **WHEN** 用户手动创建记账记录
- **THEN** accounting_record.order_id 为 None
- **THEN** 现有行为不受影响

#### Scenario: 已有数据的 order_id 字段
- **WHEN** 数据库中存在 order_id 字段添加前创建的记账记录
- **THEN** 这些记录的 order_id 自动为 NULL
- **THEN** 数据无迁移风险

### Requirement: 根据订单 ID 查询记账记录
系统 SHALL 提供根据 `order_id` 查询关联记账记录的能力。

#### Scenario: 查询订单关联的记账记录
- **WHEN** 调用查询服务传入 order_id
- **THEN** 系统返回 order_id 匹配的记账记录

#### Scenario: 查询无关联记账记录的订单
- **WHEN** 调用查询服务传入没有关联记账记录的 order_id
- **THEN** 系统返回 None

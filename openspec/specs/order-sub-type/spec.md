# 订单业务类型（order-sub-type）

## Purpose

定义订单业务类型枚举（OrderSubType），用于区分批发、零售、批发进货、同行调货等订单业务场景，以及业务类型与订单类型的约束关系和默认值规则。

## Requirements

### Requirement: 订单业务类型枚举定义
系统 SHALL 定义 `OrderSubType` 枚举，包含以下变体：
- `Wholesale`：批发（用于销售订单）
- `Retail`：零售（用于销售订单）
- `WholesalePurchase`：批发进货（用于采购订单）
- `PeerTransfer`：同行调货（用于采购订单）

枚举 MUST 以字符串形式存储在数据库中。

#### Scenario: 枚举变体完整
- **WHEN** 定义 OrderSubType 枚举
- **THEN** 包含 Wholesale、Retail、WholesalePurchase、PeerTransfer 四个变体

### Requirement: 订单业务类型默认值
创建订单时，系统 SHALL 根据订单类型和客户选择自动填充默认业务类型：
- 销售订单 + 有客户 → `Wholesale`
- 销售订单 + 无客户 → `Retail`
- 采购订单 → `WholesalePurchase`

#### Scenario: 销售订单有客户默认批发
- **WHEN** 创建销售订单并选择了客户
- **THEN** 业务类型默认为 Wholesale

#### Scenario: 销售订单无客户默认零售
- **WHEN** 创建销售订单且未选择客户
- **THEN** 业务类型默认为 Retail

#### Scenario: 采购订单默认批发进货
- **WHEN** 创建采购订单
- **THEN** 业务类型默认为 WholesalePurchase

### Requirement: 订单业务类型不可修改
订单的业务类型 MUST 在创建时确定，创建后 MUST NOT 允许修改。

#### Scenario: 更新订单时不修改业务类型
- **WHEN** 用户编辑 Pending 状态的订单
- **THEN** 业务类型字段 MUST 禁用，不允许修改

### Requirement: 业务类型与订单类型约束
系统 MUST 确保业务类型与订单类型的对应关系：销售订单只能选择 Wholesale 或 Retail，采购订单只能选择 WholesalePurchase 或 PeerTransfer。

#### Scenario: 销售订单选择有效类型
- **WHEN** 创建销售订单时用户选择 Wholesale 或 Retail
- **THEN** 系统接受该选择

#### Scenario: 销售订单选择无效类型
- **WHEN** 创建销售订单时前端提供类型选择
- **THEN** 仅显示 Wholesale 和 Retail 选项，不显示采购类型选项

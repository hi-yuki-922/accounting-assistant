# 订单结算拆分（order-settlement-split）

## Purpose

定义订单结算时按品类拆分记账的完整流程，包括订单项分组、主记账记录生成、折扣冲账记录生成、尾差处理、账本记录计数更新及事务完整性保障。

## Requirements

### Requirement: 按品类分组订单项
订单结算时，系统 SHALL 根据 order_item 关联商品的 category_id 将订单项分组。未设置 category_id 的商品（category_id 为 None）SHALL 视为"未分类"品类。

#### Scenario: 多品类订单项分组
- **WHEN** 结算包含多个品类商品的订单
- **THEN** 系统按 category_id 将订单项分组，每组合并计算 subtotal 总和

#### Scenario: 未分类商品归入默认品类
- **WHEN** 结算包含未设置 category_id 的商品的订单
- **THEN** 该商品 SHALL 视为"未分类"品类，记账到默认账本

### Requirement: 按品类生成主记账记录
每个品类分组 SHALL 生成一条主记账记录。主记账记录的 amount 为该分组内所有 order_item 的 subtotal 之和。主记账记录的 book_id 由品类的 sell_book_id（销售订单）或 purchase_book_id（采购订单）决定。

#### Scenario: 销售订单按品类生成收入记录
- **WHEN** 结算销售订单，贝类分组 subtotal 为 600，贝类品类的 sell_book_id 指向"海鲜-贝类"账本
- **THEN** 生成一条 Income 类型的记账记录，amount=600，book_id 指向"海鲜-贝类"

#### Scenario: 采购订单按品类生成支出记录
- **WHEN** 结算采购订单，贝类分组 subtotal 为 1200，贝类品类的 purchase_book_id 指向"进货-贝类"账本
- **THEN** 生成一条 Expenditure 类型的记账记录，amount=1200，book_id 指向"进货-贝类"

### Requirement: 折扣冲账记录生成
当订单的应收金额不等于实收金额（total_amount ≠ actual_amount）时，系统 SHALL 按比例为每个品类分组生成一条冲账记录。冲账记录的 accounting_type MUST 为 WriteOff，amount MUST 为负数。

#### Scenario: 有折扣时生成冲账
- **WHEN** 结算订单，应收 1010.5，实收 1000，存在贝类（subtotal=600）和鱼类（subtotal=410.5）两个分组
- **THEN** 生成两条冲账记录：
  - 贝类冲账：amount = -((1010.5 - 1000) × 600 / 1010.5)，取两位小数
  - 鱼类冲账：amount = -(10.5 - 贝类冲账绝对值)，补差值

#### Scenario: 无折扣时不生成冲账
- **WHEN** 结算订单，应收等于实收
- **THEN** 仅生成主记账记录，不生成冲账记录

### Requirement: 冲账记录关联主记录
每条冲账记录的 write_off_id MUST 指向对应的品类主记账记录的 id。冲账记录的 book_id MUST 与主记录相同。冲账记录的 order_id MUST 与主记录相同。

#### Scenario: 冲账记录正确关联
- **WHEN** 生成冲账记录
- **THEN** write_off_id 指向同品类的主记录，book_id 相同，order_id 相同

### Requirement: 冲账尾差处理
按比例分摊折扣时，最后一条冲账记录 MUST 使用补差值计算（折扣总额 - 已分摊合计），确保所有冲账金额之和严格等于 total_amount - actual_amount。

#### Scenario: 尾差精确
- **WHEN** 折扣金额无法被品类数整除
- **THEN** 最后一条冲账使用补差值，所有冲账金额之和精确等于 total_amount - actual_amount

### Requirement: 更新账本记录计数
每生成一条记账记录（主记录或冲账记录），系统 MUST 将对应账本的 record_count 加 1。

#### Scenario: 主记录增加记录计数
- **WHEN** 生成一条品类主记账记录
- **THEN** 对应账本的 record_count 加 1

#### Scenario: 冲账记录增加记录计数
- **WHEN** 生成一条冲账记录
- **THEN** 对应账本的 record_count 加 1

### Requirement: 结算事务完整性
所有记账记录的创建、冲账记录的生成、订单状态更新、账本计数更新 MUST 在同一个数据库事务中完成。

#### Scenario: 结算事务原子性
- **WHEN** 结算过程中任何步骤失败
- **THEN** 整个事务回滚，不产生部分数据

### Requirement: 结算后订单状态更新
结算成功后，系统 SHALL 将订单状态更新为 Settled，设置 channel、actual_amount（如结算时覆盖）和 settled_at。

#### Scenario: 结算成功更新状态
- **WHEN** 所有记账记录和冲账记录创建成功
- **THEN** 订单状态设为 Settled，channel 和 settled_at 被更新

### Requirement: AccountingType 新增 WriteOff 变体
`AccountingType` 枚举 MUST 新增 `WriteOff` 变体，用于标识冲账类型的记账记录。

#### Scenario: WriteOff 枚举可用
- **WHEN** 创建冲账记录时设置 accounting_type
- **THEN** 可以使用 AccountingType::WriteOff 值

### Requirement: 记账记录标题格式
主记账记录的 title 格式为 `"销售订单-{order_no}"` 或 `"采购订单-{order_no}"`。冲账记录的 title 格式为 `"折扣冲账-{主记录title}"`。

#### Scenario: 主记录标题
- **WHEN** 销售订单 #7 的贝类分组生成主记录
- **THEN** title 为 "销售订单-#7"

#### Scenario: 冲账记录标题
- **WHEN** 为贝类主记录生成冲账
- **THEN** title 为 "折扣冲账-销售订单-#7"

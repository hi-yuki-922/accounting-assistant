## Context

商品信息管理（Phase 1A）即将落地，客户管理已存在。本模块在现有分层架构上新增订单能力，核心挑战在于：
- 订单与记账记录的双向关联（order.accounting_record_id + accounting_record.order_id）
- 结账时的事务一致性：订单状态变更 + 记账记录生成需在同一个事务中完成
- 订单明细的商品名称冗余存储（商品可能改名或删除，订单应保留历史快照）
- 散客场景（customer_id 可空）与固定客户场景并存

现有技术约束：
- 实体 ID 采用日期序列模式，需配套 seq 实体
- 逻辑外键，无物理 FK 约束
- Sea-ORM entity-first，无 migration 文件
- accounting_record 已有字段：id, amount, record_time, accounting_type, title, channel, remark, write_off_id, create_at, state, book_id

## Goals / Non-Goals

**Goals:**
- 实现完整的订单生命周期：创建 → 结账/取消
- 销售订单结账时自动生成 Income 记账记录
- 采购订单结账时自动生成 Expenditure 记账记录
- 支持应收/实收双金额（覆盖抹零、让利场景）
- 支持散客（customer_id 可空）
- 订单与记账记录双向可查询

**Non-Goals:**
- 不实现退款流程（Phase 2 考虑 Cancelled 状态即可，不实现部分退款）
- 不实现库存联动（Phase 2）
- 不实现订单编辑（订单创建后只能结账或取消，不可修改明细）
- 不实现多币种
- 不实现 Agent 自然语言集成（Phase 1C）

## Decisions

### 1. 订单明细冗余存储商品名称

`order_item` 存储 `product_name` 和 `unit`，不仅依赖 `product_id`。理由：
- 商品可能改名或删除，订单应保留创建时的商品名称快照
- Agent 创建订单时可能遇到新商品（尚未录入系统），需要支持临时商品名
- 与 attachment 的 `master_id` 多态引用不同，此处冗余是必要的业务快照

### 2. 订单不可编辑，只可结账或取消

订单创建后不支持修改明细。理由：
- 简化状态机，避免 Pending → Modified → Pending 的复杂流转
- 商户如需修改可取消后重新创建
- 与记账记录的"未入账可修改，已入账不可修改"原则一致

### 3. 结账操作在事务中完成

结账时在同一事务中执行：
1. 验证订单状态为 Pending
2. 创建 accounting_record（带 order_id）
3. 更新 order 的 accounting_record_id、status 为 Settled、settled_at 时间
4. 更新对应 book 的 record_count

**替代方案**：分步操作 + 补偿 → 过于复杂，事务是最简单可靠的方式。

### 4. accounting_record.book_id 的确定策略

订单结账生成记账记录时，book_id 设置为 None（即归入默认账本"未归类账目"）。
理由：
- 订单不属于任何特定账本，记账记录的账本归属应由用户后续手动调整
- 避免自动归属逻辑带来的耦合

### 5. 订单编号格式

`order_no` 使用可读格式：`ORD-YYYYMMDD-NNNNN`（前缀 + 日期 + 当日序号），方便商户口头沟通和查找。与内部 ID（纯数字 i64）解耦。

**替代方案**：直接用 ID 做订单号 → 数字过长且不直观。

### 6. order_item 的 ID 使用自增

order_item 使用 SQLite 自增 ID，不使用日期序列。理由：
- order_item 是从属实体，不需要独立的全局唯一 ID
- 简化实现，与 attachment 的自增模式一致

### 7. 取消订单不删除记录

取消订单将 status 设为 Cancelled，不物理删除。理由：
- 保留审计轨迹
- 已取消的订单不应产生记账记录
- 与记账记录的 Posted 不可删除原则一致

## Risks / Trade-offs

- **[事务性能]** → SQLite 单写者模型下事务开销很低，桌面应用场景不存在并发瓶颈。
- **[订单不可编辑]** → 商户可能需要修改订单。Phase 2 可考虑增加"取消并重新创建"的快捷操作。当前阶段取消 + 重建是可接受的工作流。
- **[book_id 归入默认账本]** → 所有订单产生的记账记录都进入"未归类账目"，商户需要手动归类。可通过后续的自动归类规则改善。
- **[accounting_record 新增字段]** → 属于 BREAKING 变更。entity-first 模式下 Sea-ORM sync 会自动添加新列，已有数据该列为 NULL，无迁移风险。

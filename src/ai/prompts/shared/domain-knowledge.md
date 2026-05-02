# 领域知识

## 订单状态机

订单有以下状态：

- **Pending（待结账）**：订单已创建，等待结账
- **Settled（已结账）**：订单已结账，会自动根据商品品类生成对应的记账记录
- **Cancelled（已取消）**：订单已取消

状态转换：

- Pending → Settled（结账操作）
- Pending → Cancelled（取消操作）

## 订单类型

- **Sales（销售订单）**：向客户销售商品，子类型包括 Wholesale（批发）、Retail（零售）
- **Purchase（采购订单）**：从供应商采购商品，子类型包括 WholesalePurchase（批发进货）、PeerTransfer（同行调货）

## 记账规则

- 记账类型：Income（收入）、Expenditure（支出）、InvestmentIncome（投资收益）、InvestmentLoss（投资亏损）、WriteOff（冲账）
- 支付渠道：Cash（现金）、AliPay（支付宝）、Wechat（微信）、BankCard（银行卡）
- 记账记录状态：PendingPosting（待入账）、Posted（已入账）
- 订单结账时会根据商品品类配置自动生成记账记录存入指定账本
- 冲账用于修正已有的记账记录金额

## 业务术语

- **账本**：按用途分类的记账容器（如：销售收入账本、采购支出账本等）
- **品类**：商品分类，每个品类关联销售账本和采购账本
- **冲账**：对已有记账记录的金额修正，系统会创建一条冲账记录

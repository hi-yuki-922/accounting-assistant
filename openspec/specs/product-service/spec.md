## ADDED Requirements

### Requirement: 创建商品
系统 SHALL 提供 `create_product` 方法，接收商品信息并创建新商品记录。

#### Scenario: 成功创建商品
- **WHEN** 调用 `create_product` 传入有效的商品信息（name、unit 必填，其他可选）
- **THEN** 系统生成日期序列 ID，插入 `product` 表，返回创建的商品

#### Scenario: 创建商品时自动生成 ID
- **WHEN** 在 2026 年 4 月 2 日创建第一个商品
- **THEN** 商品 ID 为 `2026040200001`（日期 + 5位当日序列号）

### Requirement: 更新商品
系统 SHALL 提供 `update_product` 方法，根据商品 ID 更新商品信息。

#### Scenario: 成功更新商品
- **WHEN** 调用 `update_product` 传入已存在的商品 ID 和更新字段
- **THEN** 系统更新对应商品记录，返回更新后的商品

#### Scenario: 更新不存在的商品
- **WHEN** 调用 `update_product` 传入不存在的商品 ID
- **THEN** 系统返回错误，提示商品不存在

### Requirement: 删除商品
系统 SHALL 提供 `delete_product` 方法，根据商品 ID 删除商品。

#### Scenario: 成功删除商品
- **WHEN** 调用 `delete_product` 传入已存在的商品 ID
- **THEN** 系统删除对应商品记录

#### Scenario: 删除不存在的商品
- **WHEN** 调用 `delete_product` 传入不存在的商品 ID
- **THEN** 系统返回错误，提示商品不存在

### Requirement: 查询所有商品
系统 SHALL 提供 `get_all_products` 方法，返回所有商品列表。

#### Scenario: 查询商品列表
- **WHEN** 调用 `get_all_products`
- **THEN** 系统返回所有商品记录，按创建时间倒序排列

### Requirement: 根据 ID 查询商品
系统 SHALL 提供 `get_product_by_id` 方法，根据商品 ID 返回单个商品。

#### Scenario: 查询存在的商品
- **WHEN** 调用 `get_product_by_id` 传入已存在的商品 ID
- **THEN** 系统返回对应的商品记录

#### Scenario: 查询不存在的商品
- **WHEN** 调用 `get_product_by_id` 传入不存在的商品 ID
- **THEN** 系统返回 None

### Requirement: 模糊搜索商品
系统 SHALL 提供 `search_products` 方法，支持按商品名称、分类和关键词进行模糊搜索。

#### Scenario: 按名称搜索商品
- **WHEN** 调用 `search_products` 传入关键词 "苹果"
- **THEN** 系统返回名称中包含"苹果"的所有商品

#### Scenario: 按分类搜索商品
- **WHEN** 调用 `search_products` 传入关键词 "水果"
- **THEN** 系统返回分类中包含"水果"的所有商品

#### Scenario: 按关键词搜索商品
- **WHEN** 调用 `search_products` 传入关键词 "六头"
- **THEN** 系统返回关键词字段中包含"六头"的所有商品（如"六头鲍鱼"）

#### Scenario: 搜索无匹配结果
- **WHEN** 调用 `search_products` 传入关键词 "不存在"
- **THEN** 系统返回空列表

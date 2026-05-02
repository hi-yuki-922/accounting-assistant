use chrono::Local;
use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DatabaseConnection, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set, TransactionTrait,
};

use super::dto::{
    CreateOrderDto, QueryOrdersDto, SettleOrderDto, SettlePreview, SettlePreviewItem,
    UpdateOrderDto, WriteOffPreviewItem,
};
use crate::entity::accounting_book;
use crate::entity::accounting_record::{self, ActiveModel as AccountingActiveModel};
use crate::entity::category;
use crate::entity::order::{self, ActiveModel as OrderActiveModel, Model as OrderModel};
use crate::entity::order_item::{self, ActiveModel as OrderItemActiveModel};
use crate::entity::product;
use crate::enums::{
    AccountingChannel, AccountingRecordState, AccountingType, OrderStatus, OrderSubType, OrderType,
};
use crate::services::accounting_book::DEFAULT_BOOK_ID;
use crate::services::category::DEFAULT_CATEGORY_NAME;

/// 解析时间字符串，支持多种格式
fn parse_datetime(
    s: &str,
    is_end: bool,
) -> Result<chrono::NaiveDateTime, Box<dyn std::error::Error>> {
    // 尝试 ISO 格式
    if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S") {
        return Ok(dt);
    }
    // 尝试标准格式
    if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(s, "%Y-%m-%d %H:%M:%S") {
        return Ok(dt);
    }
    // 尝试仅日期
    let date = chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d")?;
    let time = if is_end {
        date.and_hms_opt(23, 59, 59).unwrap()
    } else {
        date.and_hms_opt(0, 0, 0).unwrap()
    };
    Ok(time)
}

/// 根据 order_type 和 customer_id 自动填充 sub_type 默认值
fn resolve_default_sub_type(order_type: &OrderType, customer_id: Option<i64>) -> OrderSubType {
    match order_type {
        OrderType::Sales => {
            if customer_id.is_some() {
                OrderSubType::Wholesale
            } else {
                OrderSubType::Retail
            }
        }
        OrderType::Purchase => OrderSubType::WholesalePurchase,
    }
}

/// 验证 sub_type 与 order_type 的匹配关系
fn validate_sub_type_match(
    sub_type: &OrderSubType,
    order_type: &OrderType,
) -> Result<(), Box<dyn std::error::Error>> {
    match (order_type, sub_type) {
        (OrderType::Sales, OrderSubType::Wholesale | OrderSubType::Retail) => Ok(()),
        (
            OrderType::Purchase,
            OrderSubType::WholesalePurchase | OrderSubType::PeerTransfer,
        ) => Ok(()),
        _ => Err("订单业务类型与订单类型不匹配".into()),
    }
}

/// 订单服务
#[derive(Debug)]
pub struct OrderService {
    db: DatabaseConnection,
}

impl OrderService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    /// 创建订单（事务中创建订单和明细，生成订单编号，计算总额）
    pub async fn create_order(
        &self,
        input: CreateOrderDto,
    ) -> Result<OrderModel, Box<dyn std::error::Error>> {
        // 验证明细不为空
        if input.items.is_empty() {
            return Err("订单明细不能为空".into());
        }

        // 解析枚举
        let order_type = input
            .order_type
            .parse::<OrderType>()
            .map_err(|_| "无效的订单类型".to_string())?;

        // 确定 sub_type
        let sub_type = match input.sub_type {
            Some(st) => {
                let parsed = st
                    .parse::<OrderSubType>()
                    .map_err(|_| "无效的订单业务类型".to_string())?;
                validate_sub_type_match(&parsed, &order_type)?;
                parsed
            }
            None => resolve_default_sub_type(&order_type, input.customer_id),
        };

        // 计算总额
        let total_amount: Decimal = input
            .items
            .iter()
            .map(|item| item.quantity * item.unit_price)
            .sum();

        let actual_amount = input.actual_amount.unwrap_or(total_amount);

        let txn = self.db.begin().await?;

        // 生成订单 ID 和编号
        let id = OrderModel::generate_id(&txn).await?;
        let now = Local::now();
        // 从 ID 中提取序列号部分（后5位），拼接为 #N 格式
        let seq_part = id % 100000;
        let order_no = format!("#{}", seq_part);

        // 创建订单
        let order_active = OrderActiveModel {
            id: Set(id),
            order_no: Set(order_no.clone()),
            order_type: Set(order_type),
            customer_id: Set(input.customer_id),
            customer_name: Set(input.customer_name),
            total_amount: Set(total_amount),
            actual_amount: Set(actual_amount),
            sub_type: Set(sub_type),
            status: Set(OrderStatus::Pending),
            channel: Set(AccountingChannel::Unknown),
            remark: Set(input.remark),
            create_at: Set(now.naive_local()),
            settled_at: Set(None),
        };

        let order = order_active.insert(&txn).await?;

        // 创建订单明细
        for item in &input.items {
            let subtotal = item.quantity * item.unit_price;
            let order_item_active = OrderItemActiveModel {
                id: sea_orm::ActiveValue::NotSet,
                order_id: Set(order.id),
                product_id: Set(item.product_id),
                product_name: Set(item.product_name.clone()),
                quantity: Set(item.quantity),
                unit: Set(item.unit.clone()),
                unit_price: Set(item.unit_price),
                subtotal: Set(subtotal),
                remark: Set(item.remark.clone()),
            };
            order_item_active.insert(&txn).await?;
        }

        txn.commit().await?;

        Ok(order)
    }

    /// 结账订单（按品类分组记账 + 折扣冲账）
    pub async fn settle_order(
        &self,
        input: SettleOrderDto,
    ) -> Result<OrderModel, Box<dyn std::error::Error>> {
        let txn = self.db.begin().await?;

        // 查找订单
        let order = order::Entity::find_by_id(input.order_id)
            .one(&txn)
            .await?
            .ok_or("订单不存在")?;

        // 验证状态
        if order.status == OrderStatus::Settled {
            return Err("订单已结账".into());
        }
        if order.status == OrderStatus::Cancelled {
            return Err("订单已取消".into());
        }

        // 解析并校验支付渠道
        let channel = input
            .channel
            .parse::<AccountingChannel>()
            .map_err(|_| "结账时必须选择有效的支付渠道".to_string())?;

        // 确定实收金额
        let actual_amount = input.actual_amount.unwrap_or(order.actual_amount);

        // 确定记账类型和标题前缀
        let (accounting_type, title_prefix) = match order.order_type {
            OrderType::Sales => (AccountingType::Income, format!("销售订单-{}", order.order_no)),
            OrderType::Purchase => (
                AccountingType::Expenditure,
                format!("采购订单-{}", order.order_no),
            ),
        };

        let now = Local::now().naive_local();

        // 查询所有订单明细
        let items = order_item::Entity::find()
            .filter(order_item::Column::OrderId.eq(order.id))
            .all(&txn)
            .await?;

        // 获取所有品类的 book_id 映射
        let all_categories = category::Entity::find().all(&txn).await?;
        let mut category_map: std::collections::HashMap<i64, category::Model> =
            std::collections::HashMap::new();
        let mut uncategorized: Option<category::Model> = None;
        for cat in all_categories {
            if cat.name == DEFAULT_CATEGORY_NAME {
                uncategorized = Some(cat.clone());
            }
            category_map.insert(cat.id, cat);
        }

        // 查询商品获取 category_id
        let product_ids: Vec<i64> = items.iter().map(|item| item.product_id).collect();
        let products = product::Entity::find()
            .filter(product::Column::Id.is_in(product_ids))
            .all(&txn)
            .await?;
        let product_category_map: std::collections::HashMap<i64, Option<i64>> = products
            .iter()
            .map(|p| (p.id, p.category_id))
            .collect();

        // 获取"未分类"品类（用于未设置 category_id 的商品）
        let default_category = uncategorized
            .as_ref()
            .map(|c| c.id)
            .unwrap_or(0i64);

        // 按 category_id 分组 order_items
        let mut grouped: std::collections::HashMap<i64, Decimal> = std::collections::HashMap::new();
        for item in &items {
            let cat_id = product_category_map
                .get(&item.product_id)
                .copied()
                .flatten()
                .unwrap_or(default_category);
            *grouped.entry(cat_id).or_insert(Decimal::ZERO) += item.subtotal;
        }

        // 确定每个分组对应的 book_id
        let get_book_id = |cat_id: i64| -> i64 {
            category_map
                .get(&cat_id)
                .map(|cat| match order.order_type {
                    OrderType::Sales => cat.sell_book_id,
                    OrderType::Purchase => cat.purchase_book_id,
                })
                .unwrap_or(DEFAULT_BOOK_ID)
        };

        // 是否有折扣
        let has_discount = order.total_amount != actual_amount;
        let discount_total = order.total_amount - actual_amount;

        // 保存主记录 ID 用于冲账关联
        let mut main_record_ids: Vec<(i64, Decimal, i64)> = Vec::new(); // (cat_id, subtotal, record_id)

        // 为每个品类分组创建主记账记录
        let mut sorted_keys: Vec<i64> = grouped.keys().copied().collect();
        sorted_keys.sort();

        for cat_id in &sorted_keys {
            let subtotal = grouped[cat_id];
            let book_id = get_book_id(*cat_id);

            let record_id = accounting_record::Model::generate_id(&txn).await?;

            let new_record = AccountingActiveModel {
                id: Set(record_id),
                amount: Set(subtotal),
                record_time: Set(now),
                accounting_type: Set(accounting_type.clone()),
                title: Set(title_prefix.clone()),
                channel: Set(channel.clone()),
                remark: Set(None),
                write_off_id: Set(None),
                create_at: Set(now),
                state: Set(AccountingRecordState::Posted),
                book_id: Set(Some(book_id)),
                order_id: Set(Some(order.id)),
            };

            new_record.insert(&txn).await?;
            main_record_ids.push((*cat_id, subtotal, record_id));

            // 更新账本 record_count +1
            let book = accounting_book::Entity::find_by_id(book_id).one(&txn).await?;
            if let Some(b) = book {
                let mut active_book: accounting_book::ActiveModel = b.into();
                active_book.record_count = Set(active_book.record_count.as_ref() + 1);
                active_book.update(&txn).await?;
            }
        }

        // 有折扣时创建冲账记录
        if has_discount && !main_record_ids.is_empty() {
            let total_subtotal: Decimal = main_record_ids.iter().map(|(_, s, _)| *s).sum();

            for (idx, (cat_id, subtotal, main_record_id)) in
                main_record_ids.iter().enumerate()
            {
                let write_off_amount = if idx == main_record_ids.len() - 1 {
                    // 最后一条用补差值
                    let allocated: Decimal = main_record_ids
                        .iter()
                        .take(idx)
                        .map(|(_, s, _)| {
                            -discount_total * (*s / total_subtotal)
                        })
                        .sum::<Decimal>();
                    -(discount_total + allocated)
                } else {
                    -discount_total * (*subtotal / total_subtotal)
                };

                // 四舍五入到两位小数
                let rounded = write_off_amount.round_dp(2);

                if rounded == Decimal::ZERO {
                    continue;
                }

                let book_id = get_book_id(*cat_id);

                let wo_record_id = accounting_record::Model::generate_id(&txn).await?;

                let write_off_record = AccountingActiveModel {
                    id: Set(wo_record_id),
                    amount: Set(rounded),
                    record_time: Set(now),
                    accounting_type: Set(AccountingType::WriteOff),
                    title: Set(format!("折扣冲账-{}", title_prefix)),
                    channel: Set(channel.clone()),
                    remark: Set(None),
                    write_off_id: Set(Some(*main_record_id)),
                    create_at: Set(now),
                    state: Set(AccountingRecordState::Posted),
                    book_id: Set(Some(book_id)),
                    order_id: Set(Some(order.id)),
                };

                write_off_record.insert(&txn).await?;

                // 更新账本 record_count +1
                let book = accounting_book::Entity::find_by_id(book_id).one(&txn).await?;
                if let Some(b) = book {
                    let mut active_book: accounting_book::ActiveModel = b.into();
                    active_book.record_count = Set(active_book.record_count.as_ref() + 1);
                    active_book.update(&txn).await?;
                }
            }
        }

        // 更新订单状态
        let mut order_active: OrderActiveModel = order.into();
        order_active.status = Set(OrderStatus::Settled);
        order_active.channel = Set(channel);
        order_active.actual_amount = Set(actual_amount);
        order_active.settled_at = Set(Some(now));
        let updated_order = order_active.update(&txn).await?;

        txn.commit().await?;

        Ok(updated_order)
    }

    /// 获取结算预览（按品类分组展示记账预览 + 折扣冲账预览）
    pub async fn get_settle_preview(
        &self,
        order_id: i64,
        actual_amount: Option<Decimal>,
    ) -> Result<SettlePreview, Box<dyn std::error::Error>> {
        // 查找订单
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await?
            .ok_or("订单不存在")?;

        // 确定实收金额
        let actual = actual_amount.unwrap_or(order.actual_amount);

        // 查询所有订单明细
        let items = order_item::Entity::find()
            .filter(order_item::Column::OrderId.eq(order.id))
            .all(&self.db)
            .await?;

        // 获取所有品类
        let all_categories = category::Entity::find().all(&self.db).await?;
        let mut category_map: std::collections::HashMap<i64, category::Model> =
            std::collections::HashMap::new();
        let mut uncategorized_id: i64 = 0;
        for cat in &all_categories {
            if cat.name == DEFAULT_CATEGORY_NAME {
                uncategorized_id = cat.id;
            }
            category_map.insert(cat.id, cat.clone());
        }

        // 查询商品获取 category_id
        let product_ids: Vec<i64> = items.iter().map(|item| item.product_id).collect();
        let products = product::Entity::find()
            .filter(product::Column::Id.is_in(product_ids))
            .all(&self.db)
            .await?;
        let product_category_map: std::collections::HashMap<i64, Option<i64>> = products
            .iter()
            .map(|p| (p.id, p.category_id))
            .collect();

        // 按 category_id 分组
        let mut grouped: std::collections::HashMap<i64, Decimal> = std::collections::HashMap::new();
        for item in &items {
            let cat_id = product_category_map
                .get(&item.product_id)
                .copied()
                .flatten()
                .unwrap_or(uncategorized_id);
            *grouped.entry(cat_id).or_insert(Decimal::ZERO) += item.subtotal;
        }

        // 获取账本名称映射
        let all_books = accounting_book::Entity::find().all(&self.db).await?;
        let book_name_map: std::collections::HashMap<i64, String> = all_books
            .iter()
            .map(|b| (b.id, b.title.clone()))
            .collect();

        // 确定每个品类对应的 book_id
        let get_book_id = |cat_id: i64| -> i64 {
            category_map
                .get(&cat_id)
                .map(|cat| match order.order_type {
                    OrderType::Sales => cat.sell_book_id,
                    OrderType::Purchase => cat.purchase_book_id,
                })
                .unwrap_or(DEFAULT_BOOK_ID)
        };

        // 构建品类分组预览
        let mut sorted_keys: Vec<i64> = grouped.keys().copied().collect();
        sorted_keys.sort();

        let category_groups: Vec<SettlePreviewItem> = sorted_keys
            .iter()
            .map(|cat_id| {
                let cat = category_map.get(cat_id);
                let cat_name = cat
                    .map(|c| c.name.clone())
                    .unwrap_or_else(|| DEFAULT_CATEGORY_NAME.to_string());
                let book_id = get_book_id(*cat_id);
                let book_name = book_name_map
                    .get(&book_id)
                    .cloned()
                    .unwrap_or_else(|| "未知账本".to_string());
                SettlePreviewItem {
                    category_id: *cat_id,
                    category_name: cat_name,
                    amount: grouped[cat_id],
                    book_id,
                    book_name,
                }
            })
            .collect();

        // 折扣冲账预览
        let has_discount = order.total_amount != actual;
        let discount_total = order.total_amount - actual;
        let discount_amount = if has_discount { Some(discount_total) } else { None };

        let write_off_preview = if has_discount && !category_groups.is_empty() {
            let total_subtotal: Decimal = category_groups.iter().map(|g| g.amount).sum();
            let mut preview_items: Vec<WriteOffPreviewItem> = Vec::new();

            for (idx, group) in category_groups.iter().enumerate() {
                let write_off_amount = if idx == category_groups.len() - 1 {
                    let allocated: Decimal = category_groups
                        .iter()
                        .take(idx)
                        .map(|g| -discount_total * (g.amount / total_subtotal))
                        .sum::<Decimal>();
                    -(discount_total + allocated)
                } else {
                    -discount_total * (group.amount / total_subtotal)
                };

                let rounded = write_off_amount.round_dp(2);
                if rounded != Decimal::ZERO {
                    preview_items.push(WriteOffPreviewItem {
                        category_name: group.category_name.clone(),
                        write_off_amount: rounded,
                        category_id: group.category_id,
                    });
                }
            }

            Some(preview_items)
        } else {
            None
        };

        Ok(SettlePreview {
            category_groups,
            write_off_preview,
            discount_amount,
        })
    }

    /// 取消订单（验证状态为 Pending 后更新为 Cancelled）
    pub async fn cancel_order(
        &self,
        order_id: i64,
    ) -> Result<OrderModel, Box<dyn std::error::Error>> {
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await?
            .ok_or("订单不存在")?;

        if order.status == OrderStatus::Settled {
            return Err("已结账订单不可取消".into());
        }
        if order.status == OrderStatus::Cancelled {
            return Err("订单已取消".into());
        }

        let mut order_active: OrderActiveModel = order.into();
        order_active.status = Set(OrderStatus::Cancelled);
        let updated_order = order_active.update(&self.db).await?;

        Ok(updated_order)
    }

    /// 编辑订单（仅允许修改 Pending 状态的明细和备注）
    pub async fn update_order(
        &self,
        input: UpdateOrderDto,
    ) -> Result<OrderModel, Box<dyn std::error::Error>> {
        let txn = self.db.begin().await?;

        // 查找订单
        let order = order::Entity::find_by_id(input.order_id)
            .one(&txn)
            .await?
            .ok_or("订单不存在")?;

        // 验证状态
        if order.status != OrderStatus::Pending {
            return Err("只有待结账订单可编辑".into());
        }

        let mut order_active: OrderActiveModel = order.into();

        // 更新备注
        if let Some(remark) = input.remark {
            order_active.remark = Set(Some(remark));
        }

        // 更新明细（替换方式）
        if let Some(items) = input.items {
            if items.is_empty() {
                return Err("订单明细不能为空".into());
            }

            // 删除旧明细
            order_item::Entity::delete_many()
                .filter(order_item::Column::OrderId.eq(input.order_id))
                .exec(&txn)
                .await?;

            // 创建新明细并计算总额
            let mut total_amount = Decimal::ZERO;
            for item in &items {
                let subtotal = item.quantity * item.unit_price;
                let order_item_active = OrderItemActiveModel {
                    id: sea_orm::ActiveValue::NotSet,
                    order_id: Set(input.order_id),
                    product_id: Set(item.product_id),
                    product_name: Set(item.product_name.clone()),
                    quantity: Set(item.quantity),
                    unit: Set(item.unit.clone()),
                    unit_price: Set(item.unit_price),
                    subtotal: Set(subtotal),
                    remark: Set(item.remark.clone()),
                };
                order_item_active.insert(&txn).await?;
                total_amount += subtotal;
            }

            // 重算金额
            order_active.total_amount = Set(total_amount);
            order_active.actual_amount = Set(total_amount);
        }

        let updated_order = order_active.update(&txn).await?;
        txn.commit().await?;

        Ok(updated_order)
    }

    /// 查询所有订单（按创建时间倒序）
    pub async fn get_all_orders(&self) -> Result<Vec<OrderModel>, Box<dyn std::error::Error>> {
        let orders = order::Entity::find()
            .order_by_desc(order::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(orders)
    }

    /// 根据 ID 查询订单（含明细）
    pub async fn get_order_by_id(
        &self,
        id: i64,
    ) -> Result<Option<(OrderModel, Vec<order_item::Model>)>, Box<dyn std::error::Error>> {
        let order = order::Entity::find_by_id(id).one(&self.db).await?;

        match order {
            Some(o) => {
                let items = order_item::Entity::find()
                    .filter(order_item::Column::OrderId.eq(o.id))
                    .all(&self.db)
                    .await?;
                Ok(Some((o, items)))
            }
            None => Ok(None),
        }
    }

    /// 按客户查询订单（按创建时间倒序）
    pub async fn get_orders_by_customer_id(
        &self,
        customer_id: i64,
    ) -> Result<Vec<OrderModel>, Box<dyn std::error::Error>> {
        let orders = order::Entity::find()
            .filter(order::Column::CustomerId.eq(customer_id))
            .order_by_desc(order::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(orders)
    }

    /// 按状态筛选订单
    pub async fn get_orders_by_status(
        &self,
        status: String,
    ) -> Result<Vec<OrderModel>, Box<dyn std::error::Error>> {
        let order_status = status
            .parse::<OrderStatus>()
            .map_err(|_| "无效的订单状态".to_string())?;
        let orders = order::Entity::find()
            .filter(order::Column::Status.eq(order_status))
            .order_by_desc(order::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(orders)
    }

    /// 分页查询订单（支持多维度筛选）
    pub async fn query_orders(
        &self,
        input: QueryOrdersDto,
    ) -> Result<(Vec<OrderModel>, u64), Box<dyn std::error::Error>> {
        let page = input.page.unwrap_or(1);
        let page_size = input.page_size.unwrap_or(20);

        let mut condition = Condition::all();

        // 时间范围筛选
        if let Some(start) = &input.start_time {
            let start_time =
                parse_datetime(start, false).map_err(|_| "无效的开始时间格式".to_string())?;
            condition = condition.add(order::Column::CreateAt.gte(start_time));
        }

        if let Some(end) = &input.end_time {
            let end_time =
                parse_datetime(end, true).map_err(|_| "无效的结束时间格式".to_string())?;
            condition = condition.add(order::Column::CreateAt.lte(end_time));
        }

        // 状态筛选
        if let Some(status) = &input.status {
            let order_status = status
                .parse::<OrderStatus>()
                .map_err(|_| "无效的订单状态".to_string())?;
            condition = condition.add(order::Column::Status.eq(order_status));
        }

        // 金额范围筛选
        if let Some(min) = input.min_amount {
            condition = condition.add(order::Column::ActualAmount.gte(min));
        }
        if let Some(max) = input.max_amount {
            condition = condition.add(order::Column::ActualAmount.lte(max));
        }

        // 支付渠道筛选
        if let Some(channel_str) = &input.channel {
            let channel = channel_str
                .parse::<AccountingChannel>()
                .map_err(|_| "无效的支付渠道".to_string())?;
            condition = condition.add(order::Column::Channel.eq(Some(channel)));
        }

        // 订单类型筛选
        if let Some(order_type_str) = &input.order_type {
            let order_type = order_type_str
                .parse::<OrderType>()
                .map_err(|_| "无效的订单类型".to_string())?;
            condition = condition.add(order::Column::OrderType.eq(order_type));
        }

        let paginator = order::Entity::find()
            .filter(condition)
            .order_by_desc(order::Column::CreateAt)
            .paginate(&self.db, page_size);

        let total = paginator.num_items().await?;
        let orders = paginator.fetch_page(page - 1).await?;

        Ok((orders, total))
    }
}

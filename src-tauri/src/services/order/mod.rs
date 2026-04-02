pub mod dto;

use rust_decimal::Decimal;
use chrono::Local;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    Set, TransactionTrait,
};
use crate::entity::order::{self, ActiveModel as OrderActiveModel, Model as OrderModel};
use crate::entity::order_item::{self, ActiveModel as OrderItemActiveModel};
use crate::entity::accounting_record::{self, ActiveModel as AccountingActiveModel};
use crate::entity::accounting_book;
use crate::enums::{AccountingChannel, AccountingRecordState, AccountingType, OrderStatus, OrderType};
use crate::services::accounting_book::DEFAULT_BOOK_ID;
use self::dto::{CreateOrderDto, SettleOrderDto};

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
        let order_type = input.order_type.parse::<OrderType>()
            .map_err(|_| "无效的订单类型".to_string())?;
        let channel = input.channel.parse::<AccountingChannel>()
            .map_err(|_| "无效的支付渠道".to_string())?;

        // 计算总额
        let total_amount: Decimal = input.items.iter()
            .map(|item| item.quantity * item.unit_price)
            .sum();

        let actual_amount = input.actual_amount.unwrap_or(total_amount);

        let txn = self.db.begin().await?;

        // 生成订单 ID 和编号
        let id = OrderModel::generate_id(&txn).await?;
        let now = Local::now();
        let date_str = now.format("%Y%m%d").to_string();
        // 从 ID 中提取序列号部分（后5位）
        let seq_part = id % 100000;
        let order_no = format!("ORD-{}-{:05}", date_str, seq_part);

        // 创建订单
        let order_active = OrderActiveModel {
            id: Set(id),
            order_no: Set(order_no.clone()),
            order_type: Set(order_type),
            customer_id: Set(input.customer_id),
            total_amount: Set(total_amount),
            actual_amount: Set(actual_amount),
            status: Set(OrderStatus::Pending),
            channel: Set(channel),
            accounting_record_id: Set(None),
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

    /// 结账订单（事务中：验证状态 → 创建 accounting_record → 更新订单状态/关联/时间 → 更新账本 record_count）
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

        // 确定实收金额
        let actual_amount = input.actual_amount.unwrap_or(order.actual_amount);

        // 确定记账类型
        let (accounting_type, title) = match order.order_type {
            OrderType::Sales => (AccountingType::Income, format!("销售订单-{}", order.order_no)),
            OrderType::Purchase => (AccountingType::Expenditure, format!("采购订单-{}", order.order_no)),
        };

        // 生成记账记录 ID
        let record_id = accounting_record::Model::generate_id(&txn).await?;
        let now = Local::now().naive_local();

        // 创建记账记录
        let new_record = AccountingActiveModel {
            id: Set(record_id),
            amount: Set(actual_amount),
            record_time: Set(now),
            accounting_type: Set(accounting_type),
            title: Set(title),
            channel: Set(order.channel.clone()),
            remark: Set(None),
            write_off_id: Set(None),
            create_at: Set(now),
            state: Set(AccountingRecordState::Posted),
            book_id: Set(Some(DEFAULT_BOOK_ID)),
            order_id: Set(Some(order.id)),
        };

        let inserted_record = new_record.insert(&txn).await?;

        // 更新订单状态
        let mut order_active: OrderActiveModel = order.into();
        order_active.status = Set(OrderStatus::Settled);
        order_active.accounting_record_id = Set(Some(inserted_record.id));
        order_active.actual_amount = Set(actual_amount);
        order_active.settled_at = Set(Some(now));
        let updated_order = order_active.update(&txn).await?;

        // 更新默认账本 record_count +1
        let book = accounting_book::Entity::find_by_id(DEFAULT_BOOK_ID)
            .one(&txn)
            .await?;

        if let Some(b) = book {
            let mut active_book: accounting_book::ActiveModel = b.into();
            active_book.record_count = Set(active_book.record_count.as_ref() + 1);
            active_book.update(&txn).await?;
        }

        txn.commit().await?;

        Ok(updated_order)
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
        let order = order::Entity::find_by_id(id)
            .one(&self.db)
            .await?;

        match order {
            Some(o) => {
                let items = order_item::Entity::find()
                    .filter(order_item::Column::OrderId.eq(o.id))
                    .all(&self.db)
                    .await?;
                Ok(Some((o, items)))
            },
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
        let order_status = status.parse::<OrderStatus>()
            .map_err(|_| "无效的订单状态".to_string())?;
        let orders = order::Entity::find()
            .filter(order::Column::Status.eq(order_status))
            .order_by_desc(order::Column::CreateAt)
            .all(&self.db)
            .await?;
        Ok(orders)
    }
}

use serde::{Deserialize, Serialize};
use sea_orm::strum::Display;
use sea_orm::strum::EnumString;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumString)]
pub enum AccountingType {
    #[strum(to_string = "收入")]
    Income,
    #[strum(to_string = "支出")]
    Expenditure,
    #[strum(to_string = "投资收益")]
    InvestmentIncome,
    #[strum(to_string = "投资亏损")]
    InvestmentLoss,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumString)]
pub enum AccountingChannel {
    #[strum(to_string = "现金")]
    Cash,
    #[strum(to_string = "支付宝")]
    AliPay,
    #[strum(to_string = "微信")]
    Wechat,
    #[strum(to_string = "银行卡")]
    BankCard,
    #[strum(to_string = "未知")]
    Unknown,
}
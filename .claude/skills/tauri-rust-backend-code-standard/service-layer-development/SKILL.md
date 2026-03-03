---
name: service-layer-development
description: Specifications to be followed when developing service layer modules
---
# 服务层开发

## 服务层组织

```
services/
├── mod.rs           # 服务模块入口
├── accounting/      # 记账服务
│   ├── mod.rs       # 服务实现
│   └── dto/         # DTO 定义
├── attachment/      # 附件服务
│   ├── mod.rs       # 服务实现
│   ├── dto/         # DTO 定义
│   └── storage.rs   # 存储抽象
└── ...
```

## DTO 模式

DTO（Data Transfer Object）用于前后端数据传输，在服务层转换为内部类型。

### 类型转换
为 DTO 实现 `to_internal_types()` 方法进行类型转换：

```rust
impl AddAccountingRecordDto {
    pub fn to_internal_types(&self) -> Result<(Decimal, NaiveDateTime, AccountingType, AccountingChannel), String> {
        // 转换 f64 为 Decimal
        let amount_decimal = Decimal::from_f64_retain(self.amount)
            .ok_or_else(|| "Invalid amount provided".to_string())?;

        // 解析日期字符串
        let parsed_datetime = NaiveDateTime::parse_from_str(&self.record_time, "%Y-%m-%d %H:%M:%S")
            .map_err(|_| "Invalid date format, expected YYYY-MM-DD HH:MM:SS".to_string())?;

        // 解析枚举
        let parsed_accounting_type = self.accounting_type.parse::<AccountingType>()
            .map_err(|_| "Invalid accounting type".to_string())?;

        let parsed_channel = self.channel.parse::<AccountingChannel>()
            .map_err(|_| "Invalid accounting channel".to_string())?;

        Ok((amount_decimal, parsed_datetime, parsed_accounting_type, parsed_channel))
    }
}
```

### DTO 组织
- DTO 文件放在 `services/{module}/dto/mod.rs`
- 每个服务模块独立管理其 DTO

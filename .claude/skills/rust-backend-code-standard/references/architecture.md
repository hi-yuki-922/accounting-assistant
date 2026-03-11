# 项目架构

本项目采用分层架构设计，确保各层职责清晰、易于维护。

## 架构层次

```
Frontend (Vue 3 + TypeScript)
    ↓ Tauri IPC Commands
Commands Layer (Rust)
    ↓ Service Layer
Business Logic Layer (Services)
    ↓ Data Access Layer
Database Layer (SQLite via Sea-ORM)
```

## 数据流向

1. **前端** 通过 Tauri IPC 调用后端命令
2. **命令层** 接收请求，调用服务层处理
3. **服务层** 执行业务逻辑，操作数据库
4. **实体层** 定义数据模型，映射数据库表

## 目录结构

```
src-tauri/src/
├── commands/           # Tauri 命令处理器 (IPC 层)
│   ├── mod.rs
│   ├── accounting.rs
│   ├── attachment.rs
│   ├── accounting_book.rs
│   └── config.rs
├── services/           # 业务逻辑层
│   ├── mod.rs
│   ├── accounting/
│   │   ├── mod.rs
│   │   └── dto/mod.rs
│   ├── attachment/
│   │   ├── mod.rs
│   │   ├── dto/mod.rs
│   │   └── storage.rs
│   └── accounting_book/
│       ├── mod.rs
│       └── dto/mod.rs
├── entity/             # Sea-ORM 实体定义 (entity-first)
│   ├── mod.rs
│   ├── prelude.rs
│   ├── accounting_record.rs
│   ├── accounting_record_seq.rs
│   ├── accounting_book.rs
│   ├── accounting_book_seq.rs
│   └── attachment.rs
├── db/                 # 数据库连接和池管理
│   ├── mod.rs
│   └── connection.rs
├── enums/              # 应用枚举定义
│   ├── mod.rs
│   └── accounting.rs
├── sidecar/            # Sidecar 进程通信层
│   ├── mod.rs
│   ├── client.rs
│   ├── error.rs
│   ├── ipc.rs
│   └── manager.rs
├── lib.rs              # 库入口和应用初始化
└── main.rs             # 二进制入口
```

## 各层职责

### Commands 层

- 接收前端 IPC 调用
- 参数验证和类型转换
- 调用服务层方法
- 将错误转换为字符串返回

### Services 层

- 实现业务逻辑
- 数据验证
- 调用数据库操作
- 返回结构化结果

### Entity 层

- 定义数据库表结构
- 实现字段映射
- 提供实体相关方法

### Enums 层

- 定义业务枚举
- 实现与数据库的转换
- 支持中文字符串映射

## 初始化流程

```rust
// lib.rs
pub fn run() {
    let mut builder = tauri::Builder::default()
        .setup(|app| {
            // 1. 获取应用数据目录
            let app_data_dir = app.path().app_data_dir()?;

            // 2. 确保目录存在
            fs::create_dir_all(&app_data_dir)?;

            // 3. 创建 Tokio 运行时
            let rt = tokio::runtime::Runtime::new().unwrap();

            // 4. 初始化数据库
            let db = rt.block_on(connection::init_db(&app_data_dir))?;
            let conn = db.unwrap();

            // 5. 注册实体
            rt.block_on(entity::with_install_entities(conn.as_ref()))?;

            // 6. 初始化服务
            init_services(app, conn.as_ref(), &rt)?;

            // 7. 管理数据库连接
            app.manage(conn);

            Ok(())
        });

    // 8. 注册命令
    builder = with_install_tauri_commands(builder);

    builder.run(tauri::generate_context!())
}
```

---
name: project-structure
description: Tauri Rust backend Project Structure Overview
---

# project structure

```
src-tauri/src/
├── main.rs              # 程序入口
├── lib.rs               # 库入口，包含 Tauri 应用构建逻辑
├── commands/            # Tauri 命令处理器（IPC 端点）
│   ├── mod.rs           # 命令注册入口
│   ├── accounting.rs    # 记账相关命令
│   ├── attachment.rs    # 附件相关命令
│   ├── accounting_book.rs # 账本相关命令
│   └── ...
├── services/            # 业务逻辑层
│   ├── mod.rs           # 服务模块入口
│   ├── accounting/      # 记账服务
│   │   ├── mod.rs       # 服务实现
│   │   └── dto/         # 数据传输对象
│   ├── attachment/      # 附件服务
│   │   ├── mod.rs       # 服务实现
│   │   ├── dto/         # 数据传输对象
│   │   └── storage.rs   # 存储抽象
│   └── ...
├── entity/              # Sea-ORM 实体定义
│   ├── mod.rs           # 实体注册
│   ├── prelude.rs       # 常用导入
│   ├── accounting_record.rs    # 记账记录实体
│   ├── accounting_book.rs      # 账本实体
│   ├── attachment.rs           # 附件实体
│   └── *_seq.rs        # 序列号实体（用于 ID 生成）
├── db/                  # 数据库层
│   ├── mod.rs           # 模块入口
│   └── connection.rs    # 连接池管理
├── enums/               # 应用枚举类型
│   ├── mod.rs           # 枚举模块入口
│   └── accounting.rs    # 记账相关枚举
├── sidecar/             # Sidecar 进程通信层
│   ├── mod.rs           # 模块入口
│   ├── client.rs        # Sidecar 客户端
│   ├── manager.rs       # 进程管理器
│   ├── ipc.rs           # IPC 协议定义
│   └── error.rs         # 错误类型
└── utils/               # 工具函数
```

## 目录职责


| 目录          | 职责                          |
|-------------|-----------------------------|
| `commands/` | Tauri IPC 命令的入口，负责参数接收和响应返回 |
| `services/` | 业务逻辑层，处理核心业务规则和流程           |
| `entity/`   | 数据库实体定义，使用 entity-first 模式  |
| `db/`       | 数据库连接池初始化和管理                |
| `enums/`    | 应用领域枚举类型，包含中文显示逻辑           |
| `sidecar/`  | Sidecar 进程通信实现              |
| `utils/`    | 通用工具函数和辅助方法                 |

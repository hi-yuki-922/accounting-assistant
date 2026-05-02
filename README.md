# Accounting Assistant

跨平台桌面记账助手，面向个人与小型企业的收支记录与财务管理应用。

## 技术栈

| 层级     | 技术                        |
| -------- | --------------------------- |
| 桌面框架 | Tauri 2.0                   |
| 前端     | React 19 + TypeScript       |
| 后端     | Rust                        |
| ORM      | Sea-ORM (SQLite)            |
| 路由     | TanStack Router             |
| 样式     | Tailwind CSS v4 + shadcn/ui |
| 状态管理 | React Hooks                 |
| AI 集成  | Vercel AI SDK + 智谱 AI     |
| 代码质量 | Ultracite + Oxlint + oxfmt  |
| 测试     | Vitest                      |

## 功能模块

- **账本管理** — 多账本支持，独立记录收支
- **收支记录** — 分类记账，附件存储
- **订单管理** — 订单与订单项的完整生命周期
- **商品管理** — 商品信息维护
- **客户管理** — 客户信息管理
- **分类管理** — 自定义收支分类体系
- **仪表盘** — 数据可视化与财务概览
- **AI 助手** — 基于大语言模型的智能财务对话

## 项目结构

```
├── src/                    # 前端源码
│   ├── routes/             # TanStack Router 文件路由
│   ├── api/                # Tauri IPC 命令调用层
│   ├── hooks/              # 自定义 Hooks（含 AI Hooks）
│   ├── components/         # UI 组件
│   ├── ai/                 # AI Agent 基建（Provider/Agent/Tools/Prompts）
│   ├── config/             # 应用配置
│   ├── lib/                # 工具函数
│   ├── types/              # TypeScript 类型定义
│   └── styles/             # 全局样式
├── src-tauri/              # Rust 后端源码
│   └── src/
│       ├── commands/       # Tauri 命令层
│       ├── services/       # 业务服务层
│       ├── entity/         # Sea-ORM 实体定义
│       ├── db/             # 数据库连接与迁移
│       ├── enums/          # 业务枚举
│       └── pages/          # 后端页面数据聚合
├── .obsidian-lib/          # 开发知识库
└── openspec/               # OpenSpec 变更管理
```

## 开发环境要求

- Node.js >= 24
- pnpm >= 10
- Rust >= 1.94
- Tauri CLI 2.x

## 快速开始

```bash
# 安装前端依赖
pnpm install

# 开发模式（启动 Vite + Tauri）
pnpm tauri dev

# 构建生产包
pnpm tauri build
```

## 常用命令

| 命令            | 说明                            |
| --------------- | ------------------------------- |
| `pnpm dev`      | 启动 Vite 开发服务器            |
| `pnpm build`    | TypeScript 类型检查 + Vite 构建 |
| `pnpm test`     | 运行测试（Vitest watch 模式）   |
| `pnpm test:run` | 运行测试（单次）                |
| `pnpm check`    | Ultracite 代码质量检查          |
| `pnpm fix`      | Ultracite 自动修复              |
| `pnpm fmt`      | oxfmt 代码格式化                |

## 许可证

[MIT](LICENSE) &copy; hi-yuki-922

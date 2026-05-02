# 知识库索引

本知识库是 **记账助手（Accounting Assistant）** 项目的开发规范与架构参考，为 Tauri 2.0 + React 19 + Rust (Sea-ORM) 技术栈提供统一的编码指导。

## 公共

| 文档                       | 说明                                                       |
| -------------------------- | ---------------------------------------------------------- |
| [[common/重要注意事项.md]] | 开发环境、数据库、金融精度、路径别名、初始化流程、开发命令 |

## 后端（backend/）

Rust 后端的开发规范，覆盖分层架构各环节。

| 文档                          | 说明                                                   |
| ----------------------------- | ------------------------------------------------------ |
| [[backend/架构概览.md]]       | 后端分层架构总览：命令层 → 服务层 → 数据访问层         |
| [[backend/模块组织与导入.md]] | Rust 模块组织方式与导入约定                            |
| [[backend/命名规范.md]]       | 结构体、枚举、函数、变量的命名规则                     |
| [[backend/格式规范.md]]       | 代码缩进、行宽、结构化格式要求                         |
| [[backend/错误处理.md]]       | 分层错误处理策略：Service → Command → 前端             |
| [[backend/异步编程.md]]       | 异步函数模式与 Tokio 运行时使用                        |
| [[backend/数据库操作.md]]     | SQLite 连接池管理与 Sea-ORM 配置                       |
| [[backend/实体层.md]]         | Entity-First 原则与 Sea-ORM 实体定义                   |
| [[backend/服务层.md]]         | 服务模块结构（mod.rs / service.rs / dto.rs）与实现模板 |
| [[backend/命令层.md]]         | Tauri `#[tauri::command]` 定义与 DTO 使用              |
| [[backend/枚举定义.md]]       | 业务枚举集中管理规范（enums 模块 + strum）             |
| [[backend/类型系统.md]]       | 货币金额必须使用 `rust_decimal::Decimal`               |
| [[backend/注释规范.md]]       | Rust 文档注释（`///`）与行内注释约定                   |
| [[backend/最佳实践.md]]       | 避免 `unwrap()`、优先 `?` 错误传播等实践               |

## 前端（frontend/）

React 19 + TypeScript 前端的开发规范。

| 文档                              | 说明                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| [[frontend/架构概览.md]]          | 前端到后端完整调用链：页面 → Hooks → API 层 → Tauri IPC，含 AI 模块  |
| [[frontend/TypeScript规范.md]]    | 类型定义使用 `type` 而非 `interface`                                 |
| [[frontend/错误处理.md]]          | `neverthrow` Result 模式 + AI Hooks try-catch 模式                   |
| [[frontend/文件组织.md]]          | 目录结构与 TanStack Router 文件路由约定                              |
| [[frontend/API层开发.md]]         | `src/api/commands/` 模块结构与 Rust 后端对齐方式                     |
| [[frontend/Hooks开发.md]]         | 自定义 Hook 模板：AI Hooks（Section 对话/列表管理）与 API 调用模式   |
| [[frontend/组件开发.md]]          | 函数式组件开发规范、按钮 Loading 状态、表单组件封装模式              |
| [[frontend/样式规范.md]]          | Tailwind CSS v4 配置与 shadcn/ui 集成                                |
| [[frontend/路由导航.md]]          | TanStack Router 文件路由与导航约定                                   |
| [[frontend/AI集成.md]]            | AI Agent 基建：Provider → Agent → Tools → Storage → Prompts 完整架构 |
| [[frontend/Ultracite代码规范.md]] | Ultracite 代码质量工具与前端编码标准，含编码限制规则                 |

## 设计（design/）

| 文档                     | 说明                                                    |
| ------------------------ | ------------------------------------------------------- |
| [[design/设计上下文.md]] | 用户画像、品牌个性、美学方向、设计原则、AI 助手界面设计 |

## 技术栈（tech-stack/）

| 文档                     | 说明                                                   |
| ------------------------ | ------------------------------------------------------ |
| [[tech-stack/技术栈.md]] | 前端、后端、开发工具完整技术栈清单（含 AI 集成相关库） |


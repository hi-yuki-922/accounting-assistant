# 知识库索引

本知识库是 **记账助手（Accounting Assistant）** 项目的开发规范与架构参考，为 Tauri 2.0 + React 19 + Rust (Sea-ORM) 技术栈提供统一的编码指导。

## 后端（backend/）

Rust 后端的开发规范，覆盖分层架构各环节。

| 文档                       | 说明                                                   |
| -------------------------- | ------------------------------------------------------ |
| [[backend/架构概览]]       | 后端分层架构总览：命令层 → 服务层 → 数据访问层         |
| [[backend/模块组织与导入]] | Rust 模块组织方式与导入约定                            |
| [[backend/命名规范]]       | 结构体、枚举、函数、变量的命名规则                     |
| [[backend/格式规范]]       | 代码缩进、行宽、结构化格式要求                         |
| [[backend/错误处理]]       | 分层错误处理策略：Service → Command → 前端             |
| [[backend/异步编程]]       | 异步函数模式与 Tokio 运行时使用                        |
| [[backend/数据库操作]]     | SQLite 连接池管理与 Sea-ORM 配置                       |
| [[backend/实体层]]         | Entity-First 原则与 Sea-ORM 实体定义                   |
| [[backend/服务层]]         | 服务模块结构（mod.rs / service.rs / dto.rs）与实现模板 |
| [[backend/命令层]]         | Tauri `#[tauri::command]` 定义与 DTO 使用              |
| [[backend/枚举定义]]       | 业务枚举集中管理规范（enums 模块 + strum）             |
| [[backend/类型系统]]       | 货币金额必须使用 `rust_decimal::Decimal`               |
| [[backend/注释规范]]       | Rust 文档注释（`///`）与行内注释约定                   |
| [[backend/最佳实践]]       | 避免 `unwrap()`、优先 `?` 错误传播等实践               |

## 前端（frontend/）

React 19 + TypeScript 前端的开发规范。

| 文档                        | 说明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| [[frontend/架构概览]]       | 前端到后端完整调用链：页面 → Hooks → API 层 → Tauri IPC      |
| [[frontend/TypeScript规范]] | 类型定义使用 `type` 而非 `interface`                         |
| [[frontend/错误处理]]       | 基于 `neverthrow` 的 `SafeAsync<T>` / `Safe<T>` 错误处理模式 |
| [[frontend/文件组织]]       | 目录结构与 TanStack Router 文件路由约定                      |
| [[frontend/API层开发]]      | `src/api/commands/` 模块结构与 Rust 后端对齐方式             |
| [[frontend/Hooks开发]]      | 自定义 Hook 模板与封装 API 调用的约定                        |
| [[frontend/组件开发]]       | 函数式组件（箭头函数风格）开发规范                           |
| [[frontend/样式规范]]       | Tailwind CSS v4 配置与 shadcn/ui 集成                        |
| [[frontend/路由导航]]       | TanStack Router 文件路由与导航约定                           |
| [[frontend/AI集成]]         | 智谱 AI 集成：聊天页面 → hooks → Vercel AI SDK               |

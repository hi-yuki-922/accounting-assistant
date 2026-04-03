# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop Accounting Assistant Application — Tauri 2.0 + React 19 + Rust (Sea-ORM) 跨平台桌面记账应用，面向个人/小型企业的收支记录与财务管理。

## Language Guidelines

- All conversations, documentation, and comments **must use Simplified Chinese**
- Technical documentation shall be formatted in Markdown with consistent Chinese terminology
- Code comments shall prioritize Chinese, with detailed explanations for critical logic

## Knowledge Base

项目维护了一份 Obsidian 知识库（`.obsidian-lib/`），包含前后端架构、编码规范、设计上下文、技术栈等完整开发文档。

### 使用方式

在探索项目、执行编码任务时，**优先使用 Obsidian MCP 工具调用知识库**获取必要的上下文：

- `mcp__obsidian__search_notes` — 按关键词搜索知识库文档
- `mcp__obsidian__read_note` — 读取特定文档
- `mcp__obsidian__read_multiple_notes` — 批量读取文档

知识库的 README 文件，提供了资料索引，在查阅知识库时，优先读 README 文件确定查阅资料的范围。

当知识库提供的内容无法满足需要时，再调用 Read、Glob、Grep 等工具对项目源码进行探索，或使用其他工具获取信息。

### 知识库结构

| 目录 | 内容 |
|---|---|
| `common/` | 重要注意事项、开发命令、初始化流程 |
| `backend/` | Rust 后端架构、命名、错误处理、数据库、实体层、服务层等规范 |
| `frontend/` | React 前端架构、TypeScript、组件、样式、路由、API 层等规范 |
| `design/` | 用户画像、品牌个性、美学方向、设计原则 |
| `tech-stack/` | 前后端技术栈清单 |

索引文件：`.obsidian-lib/README.md`

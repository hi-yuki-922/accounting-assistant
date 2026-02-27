# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Desktop Accounting Assistant Application** built with Tauri 2.0, combining a Vue 3 + TypeScript frontend with a Rust backend. It's a cross-platform desktop app for personal/small business financial tracking with income, expense, and investment recording features.

## Language Guidelines
- All conversations, documentation, and comments **must use Simplified Chinese**
- Technical documentation shall be formatted in Markdown with consistent Chinese terminology
- Code comments shall prioritize Chinese, with detailed explanations for critical logic

## Development Commands

### Full Application
```bash
pnpm tauri dev          # Run the full desktop app with hot reload (recommended for development)
pnpm tauri build        # Build the native desktop application
```

### Frontend Only
```bash
pnpm dev                # Start Vite dev server on port 1420
pnpm build              # Build frontend (runs vue-tsc type checking first)
pnpm preview            # Preview the built frontend
```

### Backend (Rust)
```bash
cd src-tauri
cargo build             # Build Rust backend
cargo run               # Run Rust backend standalone
cargo test              # Run Rust tests
cargo clippy            # Run Rust linter
```

### Sidecar (Bun)
```bash
cd src-bun
bun install             # Install Bun dependencies
bun run index.ts        # Run sidecar process directly
```

## Architecture

### Multi-Layer Architecture

```
Frontend (Vue 3 + TypeScript)
    ↓ Tauri IPC Commands
Backend Commands Layer (Rust)
    ↓ Service Layer
Business Logic Layer (Services)
    ↓ Data Access Layer
Database Layer (SQLite via Sea-ORM)
```

### Project Structure

- **`src/`** - Vue 3 frontend with Composition API (`<script setup>`)
  - `components/ui/` - Base UI components from reka-ui
  - `components/ai-elements/` - AI-specific components with streaming markdown
- **`src-tauri/src/`** - Rust backend
  - `commands/` - Tauri command handlers (IPC endpoints)
  - `services/` - Business logic layer
  - `entity/` - Sea-ORM entity definitions (entity-first approach)
  - `db/` - Database connection and pool management
  - `enums/` - Application enums (AccountingType, AccountingChannel, etc.)
  - `sidecar/` - Sidecar process communication layer
- **`src-bun/`** - Bun sidecar process for external operations

### Key Architectural Patterns

**Entity-First Database Approach:**
- Sea-ORM entities defined first, schema synced automatically
- Entities: `accounting_record`, `accounting_record_seq`
- ActiveModel pattern for database operations
- Global connection pool managed in `db::connection`

**Sidecar Architecture:**
- External process (Bun runtime) for heavy/external operations
- IPC via stdin/stdout with JSON protocol
- Managed by `SidecarManager` in `sidecar/manager.rs`
- Automatic retry logic and thread-safe operations
- Binary: `bun-sidecar-x86_64-pc-windows-mscv.exe` in `src-tauri/bin/`

**App Initialization Flow** (see `src-tauri/src/lib.rs:15-90`):
1. Create app data directory
2. Initialize sidecar client and start process
3. Spawn background thread with Tokio runtime
4. Initialize SQLite database
5. Register Sea-ORM entities and sync schema
6. Install Tauri commands

## Tech Stack

**Frontend:**
- Vue 3 with Composition API and `<script setup>`
- TypeScript
- Tailwind CSS v4
- Vite (build tool and dev server)
- reka-ui (component library)
- vue-stream-markdown (AI response streaming)
- AI SDK integration

**Backend:**
- Tauri 2.0
- Sea-ORM 2.0 with SQLite
- Tokio async runtime
- Rust Decimal for financial calculations
- Chrono for date/time
- Serde for JSON serialization

## Database Schema

### AccountingRecord Entity
- `id`: String (format: YYYYMMDDNNNNN)
- `amount`: Decimal (precise financial calculations)
- `record_time`: DateTime
- `accounting_type`: Enum (Income, Expenditure, InvestmentIncome, InvestmentLoss)
- `channel`: Enum (Cash, AliPay, Wechat, BankCard, Unknown)
- `title`: String
- `remark`: Option<String>
- `write_off_id`: Option<String>
- `create_at`: DateTime
- `state`: Enum (PendingPosting, Posted)

All enum types are defined in `src-tauri/src/enums/` with Chinese labels.

## Important Notes

- **Development**: CSP is disabled in tauri.conf.json for development
- **Build order**: Frontend must be built before Tauri can package (handled by `beforeBuildCommand`)
- **Dev server**: Runs on port 1420 (configured in tauri.conf.json)
- **Database**: SQLite database stored in app data directory
- **Sidecar errors**: Sidecar initialization failures are handled gracefully with warnings
- **Entity registration**: Must happen after database initialization due to entity-first workflow
- **Financial precision**: Always use `rust_decimal` for monetary values, never floating point

## IDE Setup

Install these VS Code extensions:
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

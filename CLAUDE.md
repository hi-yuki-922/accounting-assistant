# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Desktop Accounting Assistant Application** built with Tauri 2.0, combining a React 19 + TypeScript frontend with a Rust backend. It's a cross-platform desktop app for personal/small business financial tracking with income, expense, and investment recording features.

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
pnpm build              # Build frontend (runs tsc type checking first)
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

## Architecture

### Multi-Layer Architecture

```
Frontend (React 19 + TypeScript)
    ↓ Tauri IPC Commands
Backend Commands Layer (Rust)
    ↓ Service Layer
Business Logic Layer (Services)
    ↓ Data Access Layer
Database Layer (SQLite via Sea-ORM)
```

### Project Structure

- **`src/`** - React 19 frontend
  - `components/ui/` - shadcn/ui components based on Radix UI (Radix Nova theme)
  - `components/` - Feature components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and helpers
  - `styles/` - CSS styles (Tailwind CSS v4)
  - `types/` - TypeScript type definitions
- **`src-tauri/src/`** - Rust backend
  - `commands/` - Tauri command handlers (IPC endpoints)
  - `services/` - Business logic layer
  - `entity/` - Sea-ORM entity definitions (entity-first approach)
  - `db/` - Database connection and pool management
  - `enums/` - Application enums (AccountingType, AccountingChannel, etc.)

### Key Architectural Patterns

**Entity-First Database Approach:**
- Sea-ORM entities defined first, schema synced automatically
- Entities: `accounting_record`, `accounting_record_seq`
- ActiveModel pattern for database operations
- Global connection pool managed in `db::connection`

**App Initialization Flow** (see `src-tauri/src/lib.rs:14-46`):
1. Create app data directory
2. Initialize Tokio runtime
3. Initialize SQLite database connection pool
4. Register Sea-ORM entities and sync schema
5. Initialize services
6. Install Tauri commands
7. Manage database connection in app state

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS v4
- Vite (build tool and dev server)
- shadcn/ui (component library, Radix UI Nova theme)
- @tanstack/react-router (routing)
- Vercel AI SDK (AI integration)
- @unovis/react & recharts (data visualization)
- next-themes (theme management)
- radash (utility functions)

**Backend:**
- Tauri 2.0
- Sea-ORM 2.0-rc with SQLite
- Tokio async runtime
- Rust Decimal for financial calculations
- Chrono for date/time
- Serde for JSON serialization
- thiserror for error handling

## Important Notes

- **Development**: CSP is disabled in tauri.conf.json for development
- **Build order**: Frontend must be built before Tauri can package (handled by `beforeBuildCommand`)
- **Dev server**: Runs on port 1420 (configured in tauri.conf.json)
- **Database**: SQLite database stored in app data directory
- **Entity registration**: Must happen after database initialization due to entity-first workflow
- **Financial precision**: Always use `rust_decimal` for monetary values, never floating point
- **Path aliases**: Components imports use `@/` prefix (configured in components.json)

## Design Context

### Users
**个人与企业混合用户** - 应用同时服务于个人日常记账和小型企业财务管理需求。用户在使用时最关注：
- 快速录入收支，操作效率高
- 数据准确性和可靠性
- 清晰的财务分析和报表
- 界面直观易懂，学习成本低

### Brand Personality
**专业可靠** - 品牌传达的核心特质是可信与稳重，如专业的财务工具般让用户感到安心。视觉设计应体现：
- 稳定感：通过一致的间距、对齐和排版传递
- 可信度：使用清晰的信息层级和准确的数据呈现
- 专业性：精简的设计语言，避免过度装饰

### Aesthetic Direction
**极简主义 + 数据驱动 + 流畅动效**
- **极简主义**: 精简界面元素，突出核心内容，留白充足
- **数据驱动**: 使用数据可视化图表，清晰展示财务趋势和分析结果
- **流畅动效**: 精心设计的动画和交互细节，提升使用愉悦感但不干扰主要任务

**主题支持**: 同时支持亮色和暗色两种主题，用户可自由切换

### Design Principles
1. **极简优先** - 每个界面元素都应有明确目的，去除不必要的装饰，让用户专注于财务数据和操作

2. **数据清晰** - 财务数据必须以最清晰的方式呈现，优先考虑可读性和准确性，使用恰当的图表和可视化

3. **交互流畅** - 所有交互操作都应有流畅的反馈和动画，但动效必须服务于功能，不为动效而动效

4. **专业可信** - 设计应传递专业可靠的印象，通过一致的视觉语言、精确的间距和清晰的信息层级实现

5. **双主题适配** - 所有设计必须适配亮色和暗色两种主题，确保在不同主题下的可用性和美观度

## Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

### Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

### Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

#### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

#### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

#### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

#### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

#### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

#### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

#### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

#### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

#### Framework-Specific Guidance

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

### Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

### When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `pnpm dlx ultracite fix` before committing to ensure compliance.

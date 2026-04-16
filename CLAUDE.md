# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop Accounting Assistant Application — Tauri 2.0 + React 19 + Rust (Sea-ORM) 跨平台桌面记账应用，面向个人/小型企业的收支记录与财务管理。

## Language Guidelines

- All conversations, documentation, and comments **must use Simplified Chinese**
- Technical documentation shall be formatted in Markdown with consistent Chinese terminology
- Code comments shall prioritize Chinese, with detailed explanations for critical logic

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Knowledge Base

The project maintains an Obsidian knowledge base (`.obsidian-lib/`) containing complete development documentation covering frontend and backend architecture, coding standards, design context, tech stack, and more.

### Usage

When exploring the project and performing coding tasks, **prioritize calling the knowledge base via the Obsidian MCP tool** to obtain the necessary context:

- `mcp__obsidian__search_notes` — Search knowledge base documents by keywords
- `mcp__obsidian__read_note` — Read a specific document
- `mcp__obsidian__read_multiple_notes` — Read documents in batches

The README file of the knowledge base provides an index of materials. When consulting the knowledge base, first read the README file to determine the scope of materials to review.

When the content provided by the knowledge base is insufficient, use tools such as Read, Glob, and Grep to explore the project source code, or use other tools to obtain information.

### Knowledge Base Structure

| Directory | Content |
|---|---|
| `common/` | Important notes, development commands, initialization processes |
| `backend/` | Specifications for Rust backend architecture, naming, error handling, databases, entity layers, service layers, etc. |
| `frontend/` | Specifications for React frontend architecture, TypeScript, components, styling, routing, API layers, etc. |
| `design/` | User personas, brand personality, aesthetic direction, design principles |
| `tech-stack/` | List of frontend and backend tech stacks |

Index file: `.obsidian-lib/README.md`
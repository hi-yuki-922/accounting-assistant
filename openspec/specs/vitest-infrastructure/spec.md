## Purpose

配置 Vitest 作为前端单元测试运行器，与 Vite 构建系统集成，建立测试文件目录结构规范。

## Requirements

### Requirement: Vitest 测试基础设施

项目 SHALL 配置 vitest 作为前端单元测试运行器，与现有 Vite 构建配置集成。

#### Scenario: vitest 安装与配置
- **WHEN** 执行 `pnpm test:run`
- **THEN** vitest 正常启动，识别 `src/__tests__/` 下的测试文件
- **AND** 路径别名 `@/` 正确解析到 `src/`
- **AND** TypeScript 文件正确编译执行

#### Scenario: package.json 测试脚本
- **WHEN** 执行 `pnpm test`
- **THEN** vitest 以 watch 模式启动，监听文件变更自动重跑

#### Scenario: 测试文件不参与生产构建
- **WHEN** 执行 `pnpm build`
- **THEN** `src/__tests__/` 下的文件不包含在构建产物中

### Requirement: 测试文件目录结构

测试文件 SHALL 集中放置在 `src/__tests__/lib/` 目录下，与源码目录 `src/lib/` 对应。

#### Scenario: 目录映射关系
- **WHEN** 测试 `src/lib/formatters.ts`
- **THEN** 测试文件位于 `src/__tests__/lib/formatters.test.ts`
- **WHEN** 测试 `src/lib/message-utils.ts`
- **THEN** 测试文件位于 `src/__tests__/lib/message-utils.test.ts`

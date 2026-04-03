# Ultracite 代码规范

本项目使用 **Ultracite**，零配置预设，通过 Oxlint + Oxfmt 自动执行代码格式化和 lint 检查。

## 快速命令

- **格式化代码**：`pnpm dlx ultracite fix`
- **检查问题**：`pnpm dlx ultracite check`
- **诊断配置**：`pnpm dlx ultracite doctor`

大多数格式和常见问题可被自动修复。提交代码前运行 `pnpm dlx ultracite fix` 确保合规。

---

## 核心原则

编写**可访问、高性能、类型安全、可维护**的代码。注重清晰和明确意图，而非简短。

## 类型安全

- 函数参数和返回值使用明确类型（有助于可读性时）
- 类型未知时使用 `unknown` 而非 `any`
- 使用 `as const` 常量断言表示不可变值和字面量类型
- 利用 TypeScript 类型收窄而非类型断言
- 使用有意义的变量名替代魔法数字

## 现代 JavaScript/TypeScript

- 回调和短函数使用箭头函数
- 优先使用 `for...of` 循环而非 `.forEach()` 和索引 `for`
- 使用可选链（`?.`）和空值合并（`??`）安全访问属性
- 优先使用模板字符串而非字符串拼接
- 使用解构赋值
- 默认使用 `const`，仅需要重新赋值时使用 `let`，禁止 `var`

## 异步编程

- async 函数中始终 `await` Promise
- 使用 `async/await` 语法而非 Promise 链
- 异步代码中使用 try-catch 适当处理错误
- 不要将 async 函数作为 Promise executor

## React & JSX

- 使用函数组件，不使用类组件
- Hook 必须在顶层调用，不可条件调用
- 正确填写 Hook 依赖数组
- 列表渲染使用 `key` 属性（优先唯一 ID 而非数组索引）
- 子元素放在开闭标签之间而非作为 props
- 不要在其他组件内定义组件
- 使用语义化 HTML 和 ARIA 属性：
  - 图片提供有意义的 alt 文本
  - 使用正确的标题层级
  - 表单输入添加 label
  - 鼠标事件旁添加键盘事件处理
  - 使用语义化元素（`<button>`、`<nav>` 等）

## 错误处理与调试

- 生产代码中移除 `console.log`、`debugger`、`alert`
- 抛出 `Error` 对象（含描述性消息），而非字符串
- 有意义地使用 try-catch，不要捕获后仅重新抛出
- 错误场景优先使用早期返回而非嵌套条件

## 代码组织

- 函数保持聚焦，认知复杂度可控
- 复杂条件提取为有意义的布尔变量
- 使用早期返回减少嵌套
- 优先使用简单条件而非嵌套三元运算符
- 相关代码分组，关注点分离

## 安全

- 使用 `target="_blank"` 时添加 `rel="noopener"`
- 除非必要，避免 `dangerouslySetInnerHTML`
- 禁止使用 `eval()` 或直接赋值 `document.cookie`
- 验证和清理用户输入

## 性能

- 循环中的累加器避免使用展开语法
- 使用顶层正则字面量而非循环中创建
- 优先使用具体导入而非命名空间导入
- 避免 barrel 文件（重新导出一切的 index 文件）

## React 19+

- 使用 ref 作为 prop 而非 `React.forwardRef`

## 测试

- 在 `it()` 或 `test()` 块中编写断言
- 异步测试避免 done 回调，使用 async/await
- 提交代码中不要使用 `.only` 或 `.skip`
- 测试套件保持扁平，避免过多 `describe` 嵌套

## Oxlint 无法覆盖的领域

1. **业务逻辑正确性** - 算法验证
2. **有意义的命名** - 描述性的函数、变量、类型名称
3. **架构决策** - 组件结构、数据流、API 设计
4. **边界情况** - 边界条件和错误状态处理
5. **用户体验** - 可访问性、性能、可用性
6. **文档** - 复杂逻辑添加注释，但优先编写自文档化的代码

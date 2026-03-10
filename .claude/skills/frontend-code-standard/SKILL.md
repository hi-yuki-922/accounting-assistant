---
name: frontend-code-standard
description: Coding conventions to follow when writing front-end code
---

# 前端开发代码规范

## 命名规范

在遵守 Javascript、Typescript、Vue 官方推荐的命名规范的基础上，遵守以下规范：

### **目录、常规文件**

- 说明：常规的 js、ts、css、scss、图片等文件；（非常规示例：存放组合式函数的目录下的 js、ts 文件，通常是 hooks 目录）
- 规范：使用 Keaba Case，全小写，多个单词之间使用 `-` 连接。（`my-folder`、`test-project.ts`、`mk-form.css`）
- 示例：`test-project.ts`、`page-config-watcher.mjs`、`mk-form.css`

### **Vue 相关**

- 路由组件：
  - 说明：路由组件是指在 `vue-router` 中路由配置 `component` 属性引用的组件。
  - 规范：使用 Keaba Case，全小写，多个单词之间使用 `-` 连接。
  - 示例：`index.vue`、`voucher-info.vue`
- 常规组件：
  - 说明：非路由组件
  - 规范：使用大驼峰命名，每个单词的首字母大写
  - 示例：`VoucherSamples.vue`、`SampleForm.vue`
- **hooks(组合式函数)**
  - 说明：在 Vue 应用的概念中，“组合式函数”(Composables) 是一个利用 Vue 的组合式 API 来封装和复用**有状态逻辑**的函数。
  - 规范：以 `use` 开头，小驼峰命名
  - 示例：`useList.ts`、`useAreaData.ts`
- **组件事件函数**
  - 说明：组件的 `emit` 事件，点击事件等
  - 规范：以 `on` 开头，小驼峰命名
  - 示例：`onEdit`、`onClick`
- **组件 props、属性、原生属性**
  - 说明：父组件传递给子组件的 props、属性或元素的原生属性
  - 规范：使用 Keaba Case，全小写，多个单词之间使用 `-` 连接。
  - 示例：`model-value`、`v-model:page-size`、`@update:model-value`、`data-message`

## 前端项目结构

在创建前端的目录、文件时，遵守[项目结构规范](./references/project-structure.md);

## api 端点

api 端点目前分为两种：通过 http 请求后端接口，通过 invoke 执行 tauri icp 命令。
api 端点的调用都应该封装在 `src/api` 目录下，提供函数调用，封装规范遵守[api端点封装规范](./references/api-endpoint.md)

## 函数

项目中使用了 radash `tryit` 方法搭配 neverthrow 库实现了类似 rust `Result` 风格的函数调用。

在 `src/lib/utils` 中封装了一些桥接函数可以直接使用，如果有必要，可以继续添加桥接函数。现有的桥接函数如下：
1. `tryResult`: 由于封装同步函数
2. `tryResultAsync`: 用于封装异步函数
3. `parseJson`: 安全地解析 JSON 字符串
4. `tryCMD`: 安全地执行 ICP 调用方法 `invoke`

## 组件拆分

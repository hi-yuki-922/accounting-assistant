---
name: project-structure
description: front-end project file organization structure
type: best-practice
---

# project structure

按以下目录结构创建组织前端项目，如果创建的文件、目录不在下列目录结构内，可以自行决定。

- scripts 脚本文件
  - version.mjs
- src
  - api
    - commands 命令接口模块，与 rust 后端的 commands 模块对齐
      - accounting.ts  记账记录模块的命令调用封装
      - accounting_book.ts  账本模块的命令调用封装
      - index.ts  文件桶，导出所有命令接口模块
    - modules  http 接口模块
      - ...
      - index.ts 文件桶，到处所有接口模块
    - util.ts  请求工具（请求相关的辅助函数）
    - ... 其他接口相关的模块
    - index.ts 文件桶，导出除接口模块之外的所有模块(请求工具，其它接口相关的模块等)
  - components  全局可用的组件
    - ...
  - hooks  组合式函数
    - useList.ts
    - ...
  - layouts 页面布局组件
    - ...
  - lib(utils) 工具函数库
    - ...
  - router 路由配置
    - modules 路由模块
      - example.ts  具体一个功能模块相关的路由配置
      - ...
    - guard.ts 路由守卫
    - index.ts 创建、导出路由实例
  - style(theme) css、scss 样式
    - reset.css 全局样式重置
    - ...
    - index.scss 全局样式入口
  - types 类型定义文件
    - component.d.ts
    - auto-import.d.ts
    - ...
  - views 视图组件
    - components views 目录下共用的组件
      - ...
    - accounting-record
      - components accounting-record 目录下共用的组件
        - Example.vue 
        - ...
      - accounting-record.vue 记账记录页面
      - ...
  - App.vue
  - main.ts

## src/components：全局通用组件

此目录仅存放**通用、无业务依赖**的组件（如选择器、弹窗、加载组件等），可在项目任意模块中复用，避免存放业务强相关组件。

对于逻辑复杂或包含子组件的大型通用组件，建议采用以下目录结构组织，确保组件内聚性与可维护性：

- src
  - components
    - xxx 组件名称，采用 KebabCase 命名
      - src 组件源码目录
        - internal.ts 组件内部私有变量、函数（不对外暴露）
        - internal.css 组件内部样式（仅作用于当前组件，不影响外部）
        - components 组件内部子组件目录
          - subXXX.vue 子组件，尽在当前组件内使用
        - xxx.vue 组件主体（对外提供的核心组件）
        - expose.ts 组件对外暴露的类型、常量或工具函数
      - index.ts 组件统一导出文件（对外暴露组件主体与必要内容）

## src/router：路由配置模块

路由配置需按**业务模块、导航菜单**结构划分，每个模块对应一个独立的 `.ts` 文件，并存放在 `router/modules` 目录下。
每个路由文件需导出一个 `RouteRecordRaw` 类型的对象，内部定义该模块的路由规则（含路径、组件、元信息等）。
在 `router/index.ts` 中，需导入所有路由模块，合并为完整的路由数组后，创建并导出路由实例。

## src/views：视图组件

`src/views` 目录需与路由配置保持一致，**视图组件的文件路径需完全匹配路由路径**，确保路由与组件的对应关系清晰。

例如：路由路径为 `/base-data/sample-type` 时，对应的视图组件路径应为 `@/views/base-data/sample-type.vue`。

```typescript
export const baseDataRoute: RouteRecordRaw = {
  path: '/base-data',
  name: 'BaseData',
  component: () => import('@/layout/default.vue'),
  meta: {
    title: '基础数据',
  },
  children: [
    {
      path: 'sample-type',
      name:'SampleType',
      component: () => import('@/views/base-data/sample-type.vue'),
      meta: {
        title: '样品类型',
      },
    },
  ]
}
```

- src
  - views
    - **base-data**
      - **sample-type.vue** 视图组件


除 `components` 目录外，`views` 下其他目录的**名称、层级结构**需与路由路径严格对齐，避免路径混乱。

### 视图组件拆分规范

当视图组件代码过长（超过 **800** 行），或包含可复用的模板 / 逻辑时，需按以下规则拆分出子组件，避免单个文件过于臃肿。

仅被一个视图组件引用的子组件：放在该视图组件所在目录的 `components` 目录下。

被多个视图组件引用的子组件：
- 若引用视图在同一目录下，放在该目录的 `components` 目录下。
- 若引用视图在不同目录下，放在所有引用视图**最近的共同祖先目录**的 `components` 目录下。

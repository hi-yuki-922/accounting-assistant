---
name: api-endpoint
description: API endpoint function encapsulation
type: best-practice
---

# api-endpoint

接口调用模块需与后端的模块分组保持一致，每个业务分组对应一个独立的 `.ts` 文件。

http 接口放在 `src/api/modules` 目录下，tauri ipc 命令接口放在 `src/api/commands` 目录下

每个接口文件需通过**命名空间（Namespace）** 封装，内部统一管理该模块的**请求函数、数据类型、枚举常量**，确保代码聚合性。

## tauri IPC 调用封装示例

```ts
import { invoke } from '@tauri-apps/api/core';
import { tryCMD } from "@/lib/utils";

export namespace AccountingApi {

  export const AccountingType = {
    Income: '收入',
    Expenditure: '支出',
    // ...
  } as const

  export type AccountingRecord = {
    // ... 
  }

  export type AddAccountingRecordDto = {
    amount: number
    recordTime: string
    accountingType: string
    title: string
    channel: string
    remark?: string
    writeOffId?: number
    bookId?: number
  }

  // 添加记账记录
  export const addAccountingRecord = (input: AddAccountingRecordDto) =>
    tryCMD<AccountingRecord>('add_accounting_record', { input })
}
```





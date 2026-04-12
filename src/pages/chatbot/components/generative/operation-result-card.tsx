/**
 * 通用操作结果卡片
 * 展示操作成功/失败消息和关键数据摘要
 * 用于未定制展示的工具结果
 */

export type OperationResultCardProps = {
  result: unknown
}

export const OperationResultCard = ({ result }: OperationResultCardProps) => {
  const parsed = result as {
    success?: boolean
    message?: string
    error?: string
  }

  const isSuccess = parsed?.success !== false
  const message = parsed?.message ?? parsed?.error ?? JSON.stringify(result)

  return (
    <div
      className={`rounded-lg border p-3 ${
        isSuccess ? 'border-border' : 'border-destructive/50 bg-destructive/5'
      }`}
    >
      <p
        className={`break-words text-sm ${isSuccess ? '' : 'text-destructive'}`}
      >
        {typeof message === 'string' ? message : JSON.stringify(message)}
      </p>
    </div>
  )
}

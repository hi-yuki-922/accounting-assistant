import { createFileRoute } from '@tanstack/react-router'
import { Settings as SettingsIcon, Key, Check, X } from 'lucide-react'
import { useState } from 'react'

import { AppLayout } from '@/components/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('zhipu_api_key') || ''
  )
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
  } | null>(null)
  const [enableNotifications, setEnableNotifications] = useState(
    () => localStorage.getItem('enable_notifications') === 'true'
  )

  const handleSaveApiKey = () => {
    localStorage.setItem('zhipu_api_key', apiKey.trim())
    setValidationResult({
      message: 'API Key 已保存',
      valid: true,
    })
    setTimeout(() => setValidationResult(null), 3000)
  }
  const handleToggleNotifications = (checked: boolean) => {
    setEnableNotifications(checked)
    localStorage.setItem('enable_notifications', String(checked))
  }

  const handleClearApiKey = () => {
    setApiKey('')
    localStorage.removeItem('zhipu_api_key')
    setValidationResult({
      message: 'API Key 已清除',
      valid: false,
    })
    setTimeout(() => setValidationResult(null), 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">设置</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            管理您的应用配置和偏好设置
          </p>
        </div>

        {/* AI 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI 配置
            </CardTitle>
            <CardDescription>
              配置智谱 AI API Key 以使用 AI 助手功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">智谱 AI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="输入您的智谱 AI API Key"
                  value={apiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setApiKey(e.target.value)
                  }
                />
                {apiKey && (
                  <Button
                    variant="outline"
                    onClick={handleClearApiKey}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                您的 API Key 将安全存储在本地浏览器中
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                保存
              </Button>
            </div>

            {validationResult && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  validationResult.valid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {validationResult.valid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {validationResult.message}
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>如何获取 API Key：</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>访问智谱 AI 开放平台</li>
                <li>注册或登录账号</li>
                <li>在控制台创建 API Key</li>
                <li>复制 API Key 并粘贴到上方输入框</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              通知设置
            </CardTitle>
            <CardDescription>管理应用通知和提醒</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用通知</Label>
                <p className="text-xs text-muted-foreground">
                  接收记账提醒和财务通知
                </p>
              </div>
              <Switch
                checked={enableNotifications}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* 关于 */}
        <Card>
          <CardHeader>
            <CardTitle>关于</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">构建</span>
              <span>Development</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

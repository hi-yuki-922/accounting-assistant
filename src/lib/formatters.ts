/**
 * 金额格式化函数
 * @param amount - 金额数值
 * @param currency - 货币符号，默认为 "¥"
 * @param decimals - 小数位数，默认为 2
 * @returns 格式化后的金额字符串，例如 "¥1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = "¥",
  decimals: number = 2
): string {
  const formatted = amount.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${currency}${formatted}`
}

/**
 * 简化金额格式化函数（用于大数值）
 * @param amount - 金额数值
 * @param currency - 货币符号，默认为 "¥"
 * @returns 格式化后的金额字符串，例如 "1.2万", "128.5万"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = "¥"
): string {
  const absAmount = Math.abs(amount)
  let formatted: string
  let suffix: string = ""

  if (absAmount >= 100000000) {
    formatted = (amount / 100000000).toFixed(1)
    suffix = "亿"
  } else if (absAmount >= 10000) {
    formatted = (amount / 10000).toFixed(1)
    suffix = "万"
  } else if (absAmount >= 1000) {
    formatted = (amount / 1000).toFixed(1)
    suffix = "千"
  } else {
    formatted = amount.toFixed(2)
  }

  return `${currency}${formatted}${suffix}`
}

/**
 * 日期格式化函数
 * @param date - 日期对象或日期字符串
 * @param format - 格式类型，默认为 "default"
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | string,
  format: "default" | "short" | "long" | "time" = "default"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "无效日期"
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: format === "short" ? "numeric" : "long",
    day: "numeric",
  }

  if (format === "long") {
    options.weekday = "long"
  }

  if (format === "time") {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }

  return dateObj.toLocaleDateString("zh-CN", options)
}

/**
 * 相对时间格式化函数
 * @param date - 日期对象或日期字符串
 * @returns 相对时间字符串，例如 "今天", "昨天", "3天前"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "今天"
  if (diffInDays === 1) return "昨天"
  if (diffInDays < 7) return `${diffInDays}天前`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}月前`
  return `${Math.floor(diffInDays / 365)}年前`
}

/**
 * 百分比格式化函数
 * @param value - 数值
 * @param decimals - 小数位数，默认为 1
 * @param showSign - 是否显示正负号，默认为 true
 * @returns 格式化后的百分比字符串，例如 "+12.5%", "-5.2%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  showSign: boolean = true
): string {
  const formatted = value.toFixed(decimals)
  const sign = showSign ? (value > 0 ? "+" : "") : ""
  return `${sign}${formatted}%`
}

/**
 * 数字格式化函数（通用）
 * @param num - 数值
 * @param decimals - 小数位数，默认为 0
 * @returns 格式化后的数字字符串，例如 "1,234", "5,678.90"
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 文件大小格式化函数
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串，例如 "1.5 MB", "256 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * 时长格式化函数
 * @param seconds - 秒数
 * @returns 格式化后的时长字符串，例如 "1小时30分钟", "45秒"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)

  return parts.join("")
}

/**
 * 电话号码格式化函数
 * @param phone - 电话号码字符串
 * @returns 格式化后的电话号码，例如 "138-1234-5678"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : phone
}

/**
 * 邮箱格式化函数（隐藏部分字符）
 * @param email - 邮箱地址
 * @returns 格式化后的邮箱，例如 "z***@example.com"
 */
export function formatEmailHidden(email: string): string {
  const [username, domain] = email.split("@")
  if (username.length <= 2) return `${username[0]}***@${domain}`
  return `${username[0]}${"*".repeat(username.length - 2)}@${domain}`
}

/**
 * 银行卡号格式化函数（隐藏部分字符）
 * @param cardNumber - 银行卡号
 * @returns 格式化后的银行卡号，例如 "**** **** **** 1234"
 */
export function formatCardNumberHidden(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, "")
  const last4 = cleaned.slice(-4)
  return `**** **** **** ${last4}`
}

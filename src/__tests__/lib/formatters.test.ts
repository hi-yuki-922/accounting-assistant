import {
  formatCardNumberHidden,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDuration,
  formatEmailHidden,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatRawAmount,
  formatSignedAmount,
} from '@/lib/formatters'

describe(formatCurrency, () => {
  it('格式化正常数值', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50')
  })

  it('格式化字符串输入', () => {
    expect(formatCurrency('5678.9')).toBe('¥5,678.90')
  })

  it('null 输入返回 "-"', () => {
    expect(formatCurrency(null)).toBe('-')
  })

  it('undefined 输入返回 "-"', () => {
    expect(formatCurrency()).toBe('-')
  })

  it('naN 字符串输入返回 "-"', () => {
    expect(formatCurrency('abc')).toBe('-')
  })

  it('自定义货币符号', () => {
    expect(formatCurrency(100, '$')).toBe('$100.00')
  })

  it('自定义小数位数', () => {
    expect(formatCurrency(1234.567, '¥', 3)).toBe('¥1,234.567')
  })

  it('零值', () => {
    expect(formatCurrency(0)).toBe('¥0.00')
  })

  it('负数', () => {
    expect(formatCurrency(-1234.5)).toBe('¥-1,234.50')
  })
})

describe(formatCurrencyCompact, () => {
  it('亿级数值', () => {
    expect(formatCurrencyCompact(200_000_000)).toBe('¥2.0亿')
  })

  it('万级数值', () => {
    expect(formatCurrencyCompact(50_000)).toBe('¥5.0万')
  })

  it('千级数值', () => {
    expect(formatCurrencyCompact(5000)).toBe('¥5.0千')
  })

  it('小于千的数值', () => {
    expect(formatCurrencyCompact(999)).toBe('¥999.00')
  })

  it('负数处理', () => {
    expect(formatCurrencyCompact(-50_000)).toBe('¥-5.0万')
  })

  it('自定义货币符号', () => {
    expect(formatCurrencyCompact(50_000, '$')).toBe('$5.0万')
  })
})

describe(formatDate, () => {
  // 固定日期避免时区问题
  const date = new Date(2024, 2, 15) // 2024-03-15

  it('default 格式', () => {
    const result = formatDate(date, 'default')
    expect(result).toContain('2024')
    expect(result).toContain('3')
    expect(result).toContain('15')
  })

  it('short 格式', () => {
    const result = formatDate(date, 'short')
    expect(result).toContain('2024')
  })

  it('long 格式（含星期）', () => {
    const result = formatDate(date, 'long')
    expect(result).toContain('2024')
    expect(result).toMatch(/星期/)
  })

  it('time 格式', () => {
    const result = formatDate(date, 'time')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('datetime 格式', () => {
    const result = formatDate(date, 'datetime')
    expect(result).toContain('2024')
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('datetime-compact 格式', () => {
    const result = formatDate(date, 'datetime-compact')
    expect(result).toContain('2024')
    expect(result).toMatch(/\d{2}:\d{2}/)
    expect(result).not.toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('无效日期返回 "无效日期"', () => {
    expect(formatDate('invalid-date')).toBe('无效日期')
  })

  it('字符串日期输入', () => {
    const result = formatDate('2024-03-15')
    expect(result).toContain('2024')
  })
})

describe(formatPercentage, () => {
  it('正值带 + 号', () => {
    expect(formatPercentage(12.5)).toBe('+12.5%')
  })

  it('负值', () => {
    expect(formatPercentage(-5.2)).toBe('-5.2%')
  })

  it('零值', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('showSign=false 隐藏正号', () => {
    expect(formatPercentage(12.5, 1, false)).toBe('12.5%')
  })

  it('自定义小数位', () => {
    expect(formatPercentage(12.567, 2)).toBe('+12.57%')
  })
})

describe(formatNumber, () => {
  it('千分位格式化', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567')
  })

  it('自定义小数位数', () => {
    expect(formatNumber(1234.5, 2)).toBe('1,234.50')
  })

  it('零值', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe(formatFileSize, () => {
  it('bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('kB', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('mB', () => {
    expect(formatFileSize(1_048_576)).toBe('1 MB')
  })

  it('gB', () => {
    expect(formatFileSize(1_073_741_824)).toBe('1 GB')
  })

  it('零值', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('带小数的值', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})

describe(formatDuration, () => {
  it('完整时长（小时+分钟+秒）', () => {
    expect(formatDuration(3661)).toBe('1小时1分钟1秒')
  })

  it('分钟+秒', () => {
    expect(formatDuration(125)).toBe('2分钟5秒')
  })

  it('纯秒', () => {
    expect(formatDuration(45)).toBe('45秒')
  })

  it('零值', () => {
    expect(formatDuration(0)).toBe('0秒')
  })

  it('整小时', () => {
    expect(formatDuration(3600)).toBe('1小时')
  })
})

describe(formatPhoneNumber, () => {
  it('标准 11 位手机号', () => {
    expect(formatPhoneNumber('13812345678')).toBe('138-1234-5678')
  })

  it('非标准格式原样返回', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })

  it('含非数字字符的标准号码', () => {
    expect(formatPhoneNumber('138 1234 5678')).toBe('138-1234-5678')
  })
})

describe(formatEmailHidden, () => {
  it('长用户名', () => {
    // zhangsan: 8字符, *数量 = 8 - 2 = 6
    expect(formatEmailHidden('zhangsan@example.com')).toBe(
      'z******@example.com'
    )
  })

  it('短用户名（2字符）', () => {
    expect(formatEmailHidden('ab@example.com')).toBe('a***@example.com')
  })

  it('单字符用户名', () => {
    // username[0] 为 'a'，username.length <= 2 走 if 分支
    expect(formatEmailHidden('a@example.com')).toBe('a***@example.com')
  })
})

describe(formatCardNumberHidden, () => {
  it('标准卡号', () => {
    expect(formatCardNumberHidden('6222021234567890')).toBe(
      '**** **** **** 7890'
    )
  })

  it('含非数字字符', () => {
    expect(formatCardNumberHidden('6222-0212-3456-7890')).toBe(
      '**** **** **** 7890'
    )
  })
})

describe(formatSignedAmount, () => {
  it('收入类型（正值）', () => {
    expect(formatSignedAmount(100, true)).toBe('+100.00')
  })

  it('支出类型（负号）', () => {
    expect(formatSignedAmount(100, false)).toBe('-100.00')
  })

  it('零值无符号', () => {
    expect(formatSignedAmount(0, true)).toBe('0.00')
    expect(formatSignedAmount(0, false)).toBe('0.00')
  })

  it('自定义小数位', () => {
    expect(formatSignedAmount(123.456, true, 3)).toBe('+123.456')
  })
})

describe(formatRawAmount, () => {
  it('正常格式化', () => {
    expect(formatRawAmount(1234.5)).toBe('1234.50')
  })

  it('自定义小数位', () => {
    expect(formatRawAmount(1234.5, 3)).toBe('1234.500')
  })

  it('零值', () => {
    expect(formatRawAmount(0)).toBe('0.00')
  })
})

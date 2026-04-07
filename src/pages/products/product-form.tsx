/**
 * 商品表单组件
 * 受控组件，将表单字段 JSX、数据模型、校验逻辑封装为独立组件
 */

import { X } from 'lucide-react'

import type { Product } from '@/api/commands/product/type'
import { Badge } from '@/components/ui/badge'
import { Field, FieldError, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** 预设常用单位列表 */
const COMMON_UNITS = ['斤', '公斤', '个', '件', '箱', '盒', '袋', '瓶', '包']

/** 商品表单数据 */
export type ProductFormData = {
  name: string
  category: string
  unit: string
  sellPrice: string
  purchasePrice: string
  sku: string
  keywordsTags: string[]
  keywordsInput: string
  remark: string
}

/** 表单组件 Props */
export type ProductFormProps = {
  value: ProductFormData
  onChange: (data: ProductFormData) => void
  errors?: Record<string, string>
}

/** 解析分号分隔的关键词字符串为 Tag 列表 */
export const parseKeywords = (keywords?: string): string[] => {
  if (!keywords) {
    return []
  }
  return keywords
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 将 Tag 列表拼接为分号分隔字符串 */
export const joinKeywords = (tags: string[]): string => tags.join(';')

/** 获取默认表单数据 */
export const getDefaultProductFormData = (): ProductFormData => ({
  name: '',
  category: '',
  unit: '',
  sellPrice: '',
  purchasePrice: '',
  sku: '',
  keywordsTags: [],
  keywordsInput: '',
  remark: '',
})

/** 从 Product 模型构造表单数据 */
export const getProductFormDataFromProduct = (
  product: Product
): ProductFormData => ({
  name: product.name,
  category: product.category ?? '',
  unit: product.unit,
  sellPrice: product.defaultSellPrice?.toString() ?? '',
  purchasePrice: product.defaultPurchasePrice?.toString() ?? '',
  sku: product.sku ?? '',
  keywordsTags: parseKeywords(product.keywords),
  keywordsInput: '',
  remark: product.remark ?? '',
})

/** 校验表单数据，返回错误字段映射（空对象表示校验通过） */
export const validateProductForm = (
  data: ProductFormData
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.name.trim()) {
    errors.name = '请输入商品名称'
  }

  if (!data.unit.trim()) {
    errors.unit = '请输入计量单位'
  }

  if (data.sellPrice.trim() && Number.isNaN(Number(data.sellPrice))) {
    errors.sellPrice = '请输入有效的价格数字'
  }

  if (data.purchasePrice.trim() && Number.isNaN(Number(data.purchasePrice))) {
    errors.purchasePrice = '请输入有效的价格数字'
  }

  return errors
}

/** 商品表单受控组件 */
export const ProductForm = ({
  value,
  onChange,
  errors = {},
}: ProductFormProps) => {
  /** 更新单个文本字段 */
  const handleFieldChange = (
    field: keyof ProductFormData,
    fieldValue: string
  ) => {
    onChange({ ...value, [field]: fieldValue })
  }

  /** 添加关键词 Tag */
  const handleAddKeyword = () => {
    const trimmed = value.keywordsInput.trim()
    const newTags =
      trimmed && !value.keywordsTags.includes(trimmed)
        ? [...value.keywordsTags, trimmed]
        : value.keywordsTags
    onChange({ ...value, keywordsTags: newTags, keywordsInput: '' })
  }

  /** 删除关键词 Tag */
  const handleRemoveKeyword = (tag: string) => {
    onChange({
      ...value,
      keywordsTags: value.keywordsTags.filter((t) => t !== tag),
    })
  }

  /** 关键词输入框键盘事件 */
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  return (
    <div className="space-y-4">
      {/* 商品名称 */}
      <Field orientation="vertical">
        <FieldTitle>
          商品名称 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          id="product-name"
          value={value.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="请输入商品名称"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      {/* 商品分类 */}
      <Field orientation="vertical">
        <FieldTitle>商品分类</FieldTitle>
        <Input
          id="product-category"
          value={value.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          placeholder="请输入商品分类（可选）"
        />
      </Field>

      {/* 计量单位 */}
      <Field orientation="vertical">
        <FieldTitle>
          计量单位 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          id="product-unit"
          value={value.unit}
          onChange={(e) => handleFieldChange('unit', e.target.value)}
          placeholder="如：斤、个、箱、盒"
          className={errors.unit ? 'border-destructive' : ''}
        />
        {/* 常用单位 Chips 快捷选择 */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_UNITS.map((u) => (
            <Badge
              key={u}
              variant={value.unit === u ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => handleFieldChange('unit', u)}
            >
              {u}
            </Badge>
          ))}
        </div>
        {errors.unit && <FieldError>{errors.unit}</FieldError>}
      </Field>

      {/* 参考售价 + 参考采购价 */}
      <div className="grid grid-cols-2 gap-4">
        <Field orientation="vertical">
          <FieldTitle>参考售价</FieldTitle>
          <Input
            id="product-sell-price"
            type="number"
            step="0.01"
            value={value.sellPrice}
            onChange={(e) => handleFieldChange('sellPrice', e.target.value)}
            placeholder="0.00"
            className={errors.sellPrice ? 'border-destructive' : ''}
          />
          {errors.sellPrice && <FieldError>{errors.sellPrice}</FieldError>}
        </Field>
        <Field orientation="vertical">
          <FieldTitle>参考采购价</FieldTitle>
          <Input
            id="product-purchase-price"
            type="number"
            step="0.01"
            value={value.purchasePrice}
            onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
            placeholder="0.00"
            className={errors.purchasePrice ? 'border-destructive' : ''}
          />
          {errors.purchasePrice && (
            <FieldError>{errors.purchasePrice}</FieldError>
          )}
        </Field>
      </div>

      {/* 商品编码 */}
      <Field orientation="vertical">
        <FieldTitle>商品编码</FieldTitle>
        <Input
          id="product-sku"
          value={value.sku}
          onChange={(e) => handleFieldChange('sku', e.target.value)}
          placeholder="请输入商品编码（可选）"
        />
      </Field>

      {/* 关键词 Tag 输入 */}
      <Field orientation="vertical">
        <FieldTitle>关键词</FieldTitle>
        {/* 已添加的 Tag 列表 */}
        {value.keywordsTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.keywordsTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(tag)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`删除关键词：${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          id="product-keywords"
          value={value.keywordsInput}
          onChange={(e) => handleFieldChange('keywordsInput', e.target.value)}
          onKeyDown={handleKeywordKeyDown}
          placeholder="输入关键词后按回车添加"
        />
      </Field>

      {/* 备注 */}
      <Field orientation="vertical">
        <FieldTitle>备注</FieldTitle>
        <Textarea
          id="product-remark"
          value={value.remark}
          onChange={(e) => handleFieldChange('remark', e.target.value)}
          placeholder="请输入备注（可选）"
          rows={2}
        />
      </Field>
    </div>
  )
}

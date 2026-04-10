/**
 * 账本表单组件
 * 受控表单，用于创建和编辑账本时的数据录入
 */

import React from 'react'

import type { AccountingBook } from '@/api/commands/accounting-book/type'
import { Field, FieldTitle, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { BookIcon } from '@/config/book-icons'

import { BookIconPicker } from './book-icon-picker'

/** 表单数据类型 */
export type BookFormData = {
  title: string
  description: string
  icon: string
}

/** 表单组件 Props */
export type BookFormProps = {
  /** 表单数据（受控） */
  value: BookFormData
  /** 数据变更回调 */
  onChange: (data: BookFormData) => void
  /** 字段错误信息，key 为字段名 */
  errors?: Record<string, string>
}

/** 验证表单数据，返回错误信息映射（空对象表示验证通过） */
export const validateBookForm = (
  data: BookFormData
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.title.trim()) {
    errors.title = '请输入账本标题'
  } else if (data.title.trim().length > 20) {
    errors.title = '账本标题不能超过 20 个字符'
  }

  return errors
}

/** 获取默认表单数据 */
export const getDefaultBookFormData = (): BookFormData => ({
  title: '',
  description: '',
  icon: 'folder',
})

/** 从账本实例提取表单数据 */
export const getBookFormDataFromBook = (
  book: AccountingBook
): BookFormData => ({
  title: book.title,
  description: book.description || '',
  icon: book.icon || 'folder',
})

/** 账本表单组件 */
export const BookForm = ({ value, onChange, errors = {} }: BookFormProps) => {
  /** 标题变更处理 */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, title: e.target.value })
  }

  /** 描述变更处理 */
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ ...value, description: e.target.value })
  }

  /** 图标选择处理 */
  const handleSelectIcon = (icon: BookIcon) => {
    onChange({ ...value, icon: icon.id })
  }

  return (
    <div className="space-y-4 py-4">
      {/* 标题输入 */}
      <Field orientation="vertical">
        <FieldTitle>
          标题 <span className="text-destructive">*</span>
        </FieldTitle>
        <Input
          id="book-title"
          value={value.title}
          onChange={handleTitleChange}
          placeholder="请输入账本标题"
          maxLength={20}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <FieldError>{errors.title}</FieldError>}
        <p className="text-xs text-muted-foreground">
          最多 {value.title.length}/20 个字符
        </p>
      </Field>

      {/* 图标选择 */}
      <Field orientation="vertical">
        <FieldTitle>图标</FieldTitle>
        <BookIconPicker
          selectedIcon={value.icon}
          onSelectIcon={handleSelectIcon}
        />
      </Field>

      {/* 描述输入 */}
      <Field orientation="vertical">
        <FieldTitle>描述（可选）</FieldTitle>
        <Textarea
          id="book-description"
          value={value.description}
          onChange={handleDescriptionChange}
          placeholder="请输入账本描述"
          rows={3}
        />
      </Field>
    </div>
  )
}

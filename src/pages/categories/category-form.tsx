/**
 * 品类表单组件
 * 控制式表单，包含名称、销售账本、进货账本、备注
 */

import { useEffect, useState } from 'react'

import { accountingBook } from '@/api/commands/accounting-book'
import type { Category } from '@/api/commands/category/type'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const DEFAULT_CATEGORY_NAME = '未分类'

export type CategoryFormData = {
  name: string
  sellBookId: number
  purchaseBookId: number
  remark: string
}

type CategoryFormProps = {
  value: CategoryFormData
  onChange: (data: CategoryFormData) => void
  editingCategory?: Category | null
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  value,
  onChange,
  editingCategory,
}) => {
  const [books, setBooks] = useState<{ id: number; title: string }[]>([])

  useEffect(() => {
    accountingBook.getAll().then((result) => {
      result.match(
        (data) =>
          setBooks(
            data.map((b: { id: number; title: string }) => ({
              id: b.id,
              title: b.title,
            }))
          ),
        () => {}
      )
    })
  }, [])

  const isDefaultCategory = editingCategory?.name === DEFAULT_CATEGORY_NAME

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="category-name">
          品类名称 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="category-name"
          placeholder="请输入品类名称"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          disabled={isDefaultCategory}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sell-book">
          销售账本 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={String(value.sellBookId)}
          onValueChange={(v) => onChange({ ...value, sellBookId: Number(v) })}
        >
          <SelectTrigger id="sell-book">
            <SelectValue placeholder="选择销售账本" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.id} value={String(book.id)}>
                {book.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="purchase-book">
          进货账本 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={String(value.purchaseBookId)}
          onValueChange={(v) =>
            onChange({ ...value, purchaseBookId: Number(v) })
          }
        >
          <SelectTrigger id="purchase-book">
            <SelectValue placeholder="选择进货账本" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.id} value={String(book.id)}>
                {book.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category-remark">备注</Label>
        <Textarea
          id="category-remark"
          placeholder="可选备注"
          value={value.remark}
          onChange={(e) => onChange({ ...value, remark: e.target.value })}
        />
      </div>
    </div>
  )
}

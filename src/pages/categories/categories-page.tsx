/**
 * 品类管理页面
 * 展示品类卡片列表，支持新增/编辑/删除
 */

import { Plus, Tag } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { accountingBook } from '@/api/commands/accounting-book'
import { categoryApi } from '@/api/commands/category'
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/api/commands/category/type'
import { Button } from '@/components/ui/button'

import { CategoryCard } from './category-card'
import { CreateEditCategoryDialog } from './create-edit-category-dialog'
import { DeleteCategoryConfirmDialog } from './delete-category-confirm-dialog'

const DEFAULT_CATEGORY_NAME = '未分类'

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [bookMap, setBookMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    const [categoriesResult, booksResult] = await Promise.all([
      categoryApi.getAll(),
      accountingBook.getAll(),
    ])

    categoriesResult.match(
      (data) => {
        setCategories(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载品类列表失败: ${error.message}`)
        setLoading(false)
      }
    )

    booksResult.match(
      (data) => {
        const map: Record<number, string> = {}
        for (const b of data) {
          map[b.id] = b.title
        }
        setBookMap(map)
      },
      () => {
        /* ignore error */
      }
    )
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 创建品类
  const handleCreate = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setSaving(true)
    const result = await categoryApi.create(data as CreateCategoryDto)
    result.match(
      () => {
        toast.success('品类创建成功')
        loadData()
        setCreateDialogOpen(false)
      },
      (error) => toast.error(`创建失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 编辑品类
  const handleUpdate = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setSaving(true)
    const result = await categoryApi.update(data as UpdateCategoryDto)
    result.match(
      () => {
        toast.success('品类信息已更新')
        loadData()
        setEditDialogOpen(false)
        setEditingCategory(null)
      },
      (error) => toast.error(`更新失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 删除品类
  const handleDelete = async () => {
    if (!deletingCategory) {
      return
    }
    setDeleting(true)
    const result = await categoryApi.delete(deletingCategory.id)
    result.match(
      () => {
        toast.success('品类已删除')
        loadData()
        setDeleteDialogOpen(false)
        setDeletingCategory(null)
      },
      (error) => toast.error(`删除失败: ${error.message}`)
    )
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const hasOnlyDefault =
    categories.length === 1 && categories[0].name === DEFAULT_CATEGORY_NAME

  const renderCategoryList = () => {
    if (categories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Tag className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">暂无品类数据</p>
          <p className="text-sm mt-1">点击「新增品类」按钮添加第一个品类</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            新增品类
          </Button>
        </div>
      )
    }

    if (hasOnlyDefault) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Tag className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">暂无自定义品类</p>
          <p className="text-sm mt-1">
            创建品类后将商品归类，订单结算时可自动按品类记账到对应账本
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            新增品类
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            bookMap={bookMap}
            onEdit={(c) => {
              setEditingCategory(c)
              setEditDialogOpen(true)
            }}
            onDelete={(c) => {
              setDeletingCategory(c)
              setDeleteDialogOpen(true)
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">品类管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增品类
        </Button>
      </div>

      {/* 品类列表 */}
      {renderCategoryList()}

      {/* 创建品类弹窗 */}
      <CreateEditCategoryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreate}
        loading={saving}
      />

      {/* 编辑品类弹窗 */}
      {editingCategory && (
        <CreateEditCategoryDialog
          open={editDialogOpen}
          category={editingCategory}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingCategory(null)
          }}
          onConfirm={handleUpdate}
          loading={saving}
        />
      )}

      {/* 删除确认弹窗 */}
      {deletingCategory && (
        <DeleteCategoryConfirmDialog
          open={deleteDialogOpen}
          categoryName={deletingCategory.name}
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeletingCategory(null)
          }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

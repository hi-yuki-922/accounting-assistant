/**
 * 商品列表页面
 * 展示商品卡片列表，支持搜索、新增/编辑/删除
 */
/* eslint-disable eslint/no-void */

import { Package, Plus, Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

import { productApi } from '@/api/commands/product'
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '@/api/commands/product/type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { CreateEditProductDialog } from './create-edit-product-dialog'
import { DeleteProductConfirmDialog } from './delete-product-confirm-dialog'
import { ProductCard } from './product-card'

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 加载商品列表
  const loadProducts = useCallback(async () => {
    const result = await productApi.getAll()
    result.match(
      (data) => {
        setProducts(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载商品列表失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // 搜索
  const handleSearch = useCallback(
    async (keyword: string) => {
      setSearchKeyword(keyword)
      if (keyword.trim()) {
        const result = await productApi.search(keyword.trim())
        result.match(
          (data) => setProducts(data),
          (error) => toast.error(`搜索失败: ${error.message}`)
        )
      } else {
        loadProducts()
      }
    },
    [loadProducts]
  )

  // 创建商品
  const handleCreate = async (data: CreateProductDto | UpdateProductDto) => {
    setSaving(true)
    const result = await productApi.create(data as CreateProductDto)
    result.match(
      () => {
        toast.success('商品创建成功')
        void loadProducts()
        setCreateDialogOpen(false)
      },
      (error) => toast.error(`创建失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 编辑商品
  const handleUpdate = async (data: CreateProductDto | UpdateProductDto) => {
    setSaving(true)
    const result = await productApi.update(data as UpdateProductDto)
    result.match(
      () => {
        toast.success('商品信息已更新')
        void loadProducts()
        setEditDialogOpen(false)
        setEditingProduct(null)
      },
      (error) => toast.error(`更新失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 删除商品
  const handleDelete = async () => {
    if (!deletingProduct) {
      return
    }
    setDeleting(true)
    const result = await productApi.delete(deletingProduct.id)
    result.match(
      () => {
        toast.success('商品已删除')
        void loadProducts()
        setDeleteDialogOpen(false)
        setDeletingProduct(null)
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">商品管理</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增商品
        </Button>
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索商品名称或分类..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* 商品列表 */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">暂无商品数据</p>
          <p className="text-sm mt-1">
            {searchKeyword
              ? '未找到匹配的商品，试试其他关键词'
              : '点击「新增商品」按钮添加第一个商品'}
          </p>
          {!searchKeyword && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              新增商品
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => {
                setEditingProduct(p)
                setEditDialogOpen(true)
              }}
              onDelete={(p) => {
                setDeletingProduct(p)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* 创建商品弹窗 */}
      <CreateEditProductDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreate}
        loading={saving}
      />

      {/* 编辑商品弹窗 */}
      {editingProduct && (
        <CreateEditProductDialog
          open={editDialogOpen}
          product={editingProduct}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingProduct(null)
          }}
          onConfirm={handleUpdate}
          loading={saving}
        />
      )}

      {/* 删除确认弹窗 */}
      {deletingProduct && (
        <DeleteProductConfirmDialog
          open={deleteDialogOpen}
          product={{
            name: deletingProduct.name,
            unit: deletingProduct.unit,
            category: deletingProduct.category,
          }}
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeletingProduct(null)
          }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

/**
 * 客户列表页面
 * 展示客户卡片列表，支持搜索、分类筛选、新增/编辑/删除
 */

import { Plus, Search, Users } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { customerApi } from '@/api/commands/customer'
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@/api/commands/customer/type'
import type { CustomerCategory } from '@/api/commands/customer/type'
import { CUSTOMER_CATEGORY_LABELS } from '@/api/commands/customer/type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CreateEditCustomerDialog } from './components/create-edit-customer-dialog'
import { CustomerCard } from './components/customer-card'
import { DeleteCustomerConfirmDialog } from './components/delete-customer-confirm-dialog'

type FilterTab = 'all' | CustomerCategory

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 加载客户列表
  const loadCustomers = useCallback(async () => {
    const result = await customerApi.getAll()
    result.match(
      (data) => {
        setCustomers(data)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载客户列表失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // 搜索：使用后端搜索，如果没有关键词则前端过滤
  const handleSearch = useCallback(
    async (keyword: string) => {
      setSearchKeyword(keyword)
      if (keyword.trim()) {
        const result = await customerApi.search(keyword.trim())
        result.match(
          (data) => setCustomers(data),
          (error) => toast.error(`搜索失败: ${error.message}`)
        )
      } else {
        loadCustomers()
      }
    },
    [loadCustomers]
  )

  // 前端分类过滤
  const filteredCustomers = useMemo(() => {
    if (activeTab === 'all') {
      return customers
    }
    return customers.filter((c) => c.category === activeTab)
  }, [customers, activeTab])

  // 创建客户
  const handleCreate = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    setSaving(true)
    const result = await customerApi.create(data as CreateCustomerDto)
    result.match(
      () => {
        toast.success('客户创建成功')
        void loadCustomers()
        setCreateDialogOpen(false)
      },
      (error) => toast.error(`创建失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 编辑客户
  const handleUpdate = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    setSaving(true)
    const result = await customerApi.update(data as UpdateCustomerDto)
    result.match(
      () => {
        toast.success('客户信息已更新')
        void loadCustomers()
        setEditDialogOpen(false)
        setEditingCustomer(null)
      },
      (error) => toast.error(`更新失败: ${error.message}`)
    )
    setSaving(false)
  }

  // 删除客户
  const handleDelete = async () => {
    if (!deletingCustomer) {
      return
    }
    setDeleting(true)
    const result = await customerApi.delete(deletingCustomer.id)
    result.match(
      () => {
        toast.success('客户已删除')
        void loadCustomers()
        setDeleteDialogOpen(false)
        setDeletingCustomer(null)
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          客户管理
        </h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增客户
        </Button>
      </div>

      {/* 搜索 + 筛选 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名或电话..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="Retailer">零售商</TabsTrigger>
            <TabsTrigger value="Supplier">供应商</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 客户列表 */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">暂无客户数据</p>
          <p className="text-sm mt-1">
            {searchKeyword
              ? '未找到匹配的客户，试试其他关键词'
              : '点击「新增客户」按钮添加第一个客户'}
          </p>
          {!searchKeyword && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              新增客户
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={(c) => {
                setEditingCustomer(c)
                setEditDialogOpen(true)
              }}
              onDelete={(c) => {
                setDeletingCustomer(c)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* 创建客户弹窗 */}
      <CreateEditCustomerDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreate}
        loading={saving}
      />

      {/* 编辑客户弹窗 */}
      {editingCustomer && (
        <CreateEditCustomerDialog
          open={editDialogOpen}
          customer={editingCustomer}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingCustomer(null)
          }}
          onConfirm={handleUpdate}
          loading={saving}
        />
      )}

      {/* 删除确认弹窗 */}
      {deletingCustomer && (
        <DeleteCustomerConfirmDialog
          open={deleteDialogOpen}
          customer={{
            name: deletingCustomer.name,
            category: deletingCustomer.category,
            phone: deletingCustomer.phone,
          }}
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeletingCustomer(null)
          }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

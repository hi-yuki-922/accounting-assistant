/**
 * 账本详情页面
 * 展示账本信息和记账记录，支持增删改查、批量入账、冲账等操作
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Trash2, Plus, CheckCircle } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { accounting } from '@/api/commands/accounting'
import { accountingBook } from '@/api/commands/accounting-book'
import type { AccountingBook } from '@/api/commands/accounting-book/type'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { DEFAULT_BOOK_ID } from '@/api/commands/accounting-book/type'
import type {
  AccountingType,
  AccountingChannel,
  AccountingRecordState,
} from '@/api/commands/accounting/enums'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Spinner } from '@/components/ui/spinner'

import { AddRecordDialog } from './components/add-record-dialog'
import { BatchPostConfirmDialog } from './components/batch-post-confirm-dialog'
import { CreateEditBookDialog } from './components/create-edit-book-dialog'
import { DeleteBookConfirmDialog } from './components/delete-book-confirm-dialog'
import { DeleteRecordConfirmDialog } from './components/delete-record-confirm-dialog'
import { EditRecordDialog } from './components/edit-record-dialog'
import { RecordFilter } from './components/record-filter'
import { RecordListTable } from './components/record-list-table'
import { WriteOffDialog } from './components/write-off-dialog'

/** 将后端返回的 Decimal 字符串字段转换为数字 */
const normalizeRecord = (record: RecordWithCountDto): RecordWithCountDto => ({
  ...record,
  amount: Number(record.amount),
  originalAmount: Number(record.originalAmount),
  netAmount: Number(record.netAmount),
})

export const BookDetailPage = () => {
  const navigate = useNavigate()
  const { bookId } = useParams({ from: '/books/$bookId' })
  const numericBookId = Number(bookId)

  // 基础状态
  const [book, setBook] = useState<AccountingBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<RecordWithCountDto[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    startTime: null as Date | null,
    endTime: null as Date | null,
    accountingType: undefined as AccountingType | undefined,
    channel: undefined as AccountingChannel | undefined,
    state: undefined as AccountingRecordState | undefined,
  })

  // 账本编辑/删除对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 记录操作对话框
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editRecordDialogOpen, setEditRecordDialogOpen] = useState(false)
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false)
  const [writeOffDialogOpen, setWriteOffDialogOpen] = useState(false)
  const [batchPostDialogOpen, setBatchPostDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<RecordWithCountDto | null>(
    null
  )
  const [deletingRecord, setDeletingRecord] =
    useState<RecordWithCountDto | null>(null)
  const [writeOffRecord, setWriteOffRecord] =
    useState<RecordWithCountDto | null>(null)

  // 选择和排序状态
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [sortField, setSortField] = useState<string>('recordTime')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [refreshCounter, setRefreshCounter] = useState(0)

  // 加载账本详情
  const loadBookDetail = useCallback(async () => {
    if (!bookId) {
      return
    }

    const result = await accountingBook.getById(numericBookId)
    result.match(
      (b) => {
        setBook(b)
        setLoading(false)
      },
      (error) => {
        toast.error(`加载账本详情失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [bookId, numericBookId])

  // 加载记录列表
  const loadRecords = useCallback(async () => {
    if (!bookId) {
      return
    }

    const formatDateTime = (date: Date, isEndTime = false) => {
      const time = isEndTime ? '23:59:59' : '00:00:00'
      return format(date, 'yyyy-MM-dd') + 'T' + time
    }

    const result = await accountingBook.getRecordsByBookId({
      bookId: numericBookId,
      page: pagination.page,
      pageSize: pagination.pageSize,
      startTime: filters.startTime
        ? formatDateTime(filters.startTime)
        : undefined,
      endTime: filters.endTime
        ? formatDateTime(filters.endTime, true)
        : undefined,
      accountingType: filters.accountingType,
      channel: filters.channel,
      state: filters.state,
    })
    result.match(
      (response) => {
        setRecords(response.data.map(normalizeRecord))
        setPagination((prev) => ({
          ...prev,
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        }))
        setLoading(false)
      },
      (error) => {
        toast.error(`加载记录失败: ${error.message}`)
        setLoading(false)
      }
    )
  }, [
    bookId,
    numericBookId,
    pagination.page,
    pagination.pageSize,
    filters,
    refreshCounter,
  ])

  useEffect(() => {
    loadBookDetail()
  }, [loadBookDetail])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // 客户端排序记录
  const sortedRecords = useMemo(() => {
    const sorted = [...records]
    const dir = sortDirection === 'asc' ? 1 : -1

    sorted.sort((a, b) => {
      switch (sortField) {
        case 'recordTime': {
          return (
            dir *
            (new Date(a.recordTime).getTime() -
              new Date(b.recordTime).getTime())
          )
        }
        case 'channel': {
          return dir * a.channel.localeCompare(b.channel)
        }
        case 'state': {
          return dir * a.state.localeCompare(b.state)
        }
        case 'relatedCount': {
          return dir * (a.relatedCount - b.relatedCount)
        }
        default: {
          return 0
        }
      }
    })

    return sorted
  }, [records, sortField, sortDirection])

  // 刷新到第一页（添加/删除/批量入账后使用）
  const refreshToFirstPage = () => {
    setSelectedIds(new Set())
    setPagination((prev) => ({ ...prev, page: 1 }))
    setRefreshCounter((c) => c + 1)
    void loadBookDetail()
  }

  // 保留当前页刷新（编辑/冲账/入账后使用）
  const refreshCurrentPage = () => {
    setSelectedIds(new Set())
    setRefreshCounter((c) => c + 1)
  }

  // 筛选器变更
  const handleFilterChange = (newFilters: {
    startTime?: Date | null
    endTime?: Date | null
    accountingType?: AccountingType
    channel?: AccountingChannel
    state?: AccountingRecordState
  }) => {
    setFilters({ ...filters, ...newFilters })
    setPagination({ ...pagination, page: 1 })
  }

  // 页码变更
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  // 排序变更
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
  }

  // 选择变更
  const handleSelectionChange = (ids: Set<number>) => {
    setSelectedIds(ids)
  }

  // 编辑账本
  const handleEditBook = async (data: {
    title: string
    description: string
    icon: string
  }) => {
    if (!book) {
      return
    }

    setSaving(true)
    const result = await accountingBook.update({ id: book.id, ...data })
    result.match(
      () => {
        void loadBookDetail()
        setEditDialogOpen(false)
        toast.success('账本更新成功')
      },
      (error) => {
        toast.error(`更新账本失败: ${error.message}`)
      }
    )
    setSaving(false)
  }

  // 删除账本
  const handleDeleteBook = async () => {
    if (!book) {
      return
    }

    setDeleting(true)
    const result = await accountingBook.delete(book.id)
    result.match(
      () => {
        navigate({ to: '/books' })
      },
      (error) => {
        toast.error(`删除账本失败: ${error.message}`)
      }
    )
    setDeleting(false)
  }

  // 记一笔成功
  const handleAddSuccess = () => {
    setAddDialogOpen(false)
    refreshToFirstPage()
  }

  // 编辑记录
  const handleEditRecord = (record: RecordWithCountDto) => {
    setEditingRecord(record)
    setEditRecordDialogOpen(true)
  }

  // 编辑成功
  const handleEditSuccess = () => {
    setEditRecordDialogOpen(false)
    setEditingRecord(null)
    refreshCurrentPage()
  }

  // 删除记录
  const handleDeleteRecord = (record: RecordWithCountDto) => {
    setDeletingRecord(record)
    setDeleteRecordDialogOpen(true)
  }

  // 删除成功
  const handleDeleteSuccess = () => {
    setDeleteRecordDialogOpen(false)
    setDeletingRecord(null)
    refreshToFirstPage()
  }

  // 单条入账
  const handlePostRecord = async (record: RecordWithCountDto) => {
    const result = await accounting.post({ id: record.id })
    result.match(
      () => {
        toast.success('入账成功')
        refreshCurrentPage()
      },
      (error) => {
        toast.error(`入账失败: ${error.message}`)
      }
    )
  }

  // 冲账
  const handleWriteOff = (record: RecordWithCountDto) => {
    setWriteOffRecord(record)
    setWriteOffDialogOpen(true)
  }

  // 冲账成功
  const handleWriteOffSuccess = () => {
    setWriteOffDialogOpen(false)
    setWriteOffRecord(null)
    refreshToFirstPage()
  }

  // 批量入账
  const handleBatchPost = () => {
    if (selectedIds.size === 0) {
      toast.warning('请先选择要入账的记录')
      return
    }
    setBatchPostDialogOpen(true)
  }

  // 批量入账成功
  const handleBatchPostSuccess = () => {
    setBatchPostDialogOpen(false)
    refreshToFirstPage()
  }

  // 选中的记录列表（用于批量入账确认对话框）
  const selectedRecords = records.filter((r) => selectedIds.has(r.id))

  // 生成页码数组
  const getPageNumbers = () => {
    const { page, totalPages } = pagination
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (loading && !book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-6" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-muted-foreground">账本不存在</span>
      </div>
    )
  }

  const isDefaultBook = book.id === DEFAULT_BOOK_ID

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/books' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{book.title}</h1>
            {book.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {book.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 记一笔按钮 */}
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            记一笔
          </Button>

          {/* 批量入账按钮 */}
          <Button
            variant="outline"
            onClick={handleBatchPost}
            disabled={selectedIds.size === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            批量入账
            {selectedIds.size > 0 && ` (${selectedIds.size})`}
          </Button>

          {/* 编辑账本 */}
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </Button>

          {/* 删除账本 */}
          {!isDefaultBook && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          )}
        </div>
      </div>

      {/* 筛选器 */}
      <RecordFilter
        startTime={filters.startTime}
        endTime={filters.endTime}
        accountingType={filters.accountingType}
        channel={filters.channel}
        state={filters.state}
        onChange={handleFilterChange}
      />

      {/* 记录列表 */}
      {records.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg">
          <div className="w-16 h-16 mb-4 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground mb-2">暂无记账记录</p>
          <p className="text-sm text-muted-foreground">
            点击"记一笔"添加第一条记录
          </p>
        </div>
      ) : (
        <RecordListTable
          records={sortedRecords}
          loading={loading}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          onPost={handlePostRecord}
          onWriteOff={handleWriteOff}
        />
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    pagination.page > 1 && handlePageChange(pagination.page - 1)
                  }
                  className={
                    pagination.page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  上一页
                </PaginationPrevious>
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={page === pagination.page}
                      onClick={() => handlePageChange(page as number)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.page < pagination.totalPages &&
                    handlePageChange(pagination.page + 1)
                  }
                  className={
                    pagination.page >= pagination.totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  下一页
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 记一笔对话框 */}
      <AddRecordDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
        bookId={numericBookId}
      />

      {/* 编辑记录对话框 */}
      {editingRecord && (
        <EditRecordDialog
          open={editRecordDialogOpen}
          onClose={() => {
            setEditRecordDialogOpen(false)
            setEditingRecord(null)
          }}
          onSuccess={handleEditSuccess}
          record={editingRecord}
        />
      )}

      {/* 删除记录确认对话框 */}
      {deletingRecord && (
        <DeleteRecordConfirmDialog
          open={deleteRecordDialogOpen}
          onClose={() => {
            setDeleteRecordDialogOpen(false)
            setDeletingRecord(null)
          }}
          onSuccess={handleDeleteSuccess}
          record={deletingRecord}
        />
      )}

      {/* 冲账对话框 */}
      {writeOffRecord && (
        <WriteOffDialog
          open={writeOffDialogOpen}
          onClose={() => {
            setWriteOffDialogOpen(false)
            setWriteOffRecord(null)
          }}
          onSuccess={handleWriteOffSuccess}
          record={writeOffRecord}
        />
      )}

      {/* 批量入账确认对话框 */}
      <BatchPostConfirmDialog
        open={batchPostDialogOpen}
        onClose={() => setBatchPostDialogOpen(false)}
        onSuccess={handleBatchPostSuccess}
        selectedRecords={selectedRecords}
      />

      {/* 编辑账本对话框 */}
      {book && (
        <CreateEditBookDialog
          open={editDialogOpen}
          book={book}
          onClose={() => setEditDialogOpen(false)}
          onConfirm={handleEditBook}
          loading={saving}
        />
      )}

      {/* 删除账本确认对话框 */}
      {book && (
        <DeleteBookConfirmDialog
          open={deleteDialogOpen}
          book={{
            title: book.title,
            recordCount: book.recordCount,
          }}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteBook}
          loading={deleting}
        />
      )}
    </div>
  )
}

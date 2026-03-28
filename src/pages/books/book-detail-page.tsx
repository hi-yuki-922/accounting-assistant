/**
 * 账本详情页面
 * 展示账本信息和记账记录
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { formatISO } from 'date-fns'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import type {
  AccountingType,
  AccountingChannel,
  AccountingRecordState,
} from '@/api/commands'
import { accountingBook } from '@/api/commands/accounting-book'
import type { AccountingBook } from '@/api/commands/accounting-book/type'
import type { RecordWithCountDto } from '@/api/commands/accounting-book/type'
import { DEFAULT_BOOK_ID } from '@/api/commands/accounting-book/type'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { CreateEditBookDialog } from './components/create-edit-book-dialog'
import { DeleteBookConfirmDialog } from './components/delete-book-confirm-dialog'
import { RecordFilter } from './components/record-filter'
import { RecordListTable } from './components/record-list-table'

export const BookDetailPage = () => {
  const navigate = useNavigate()
  const { bookId } = useParams({ from: '/books/$bookId' })
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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 加载账本详情
  const loadBookDetail = useCallback(async () => {
    if (!bookId) {
      return
    }

    const result = await accountingBook.getById(Number(bookId))
    result.match(
      (book) => {
        setBook(book)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load book detail:', error)
        setLoading(false)
      }
    )
  }, [bookId])

  // 加载记录列表
  const loadRecords = useCallback(async () => {
    if (!bookId) {
      return
    }

    const result = await accountingBook.getRecordsByBookId({
      book_id: Number(bookId),
      page: pagination.page,
      page_size: pagination.pageSize,
      start_time: filters.startTime ? formatISO(filters.startTime) : undefined,
      end_time: filters.endTime ? formatISO(filters.endTime) : undefined,
      accounting_type: filters.accountingType,
      channel: filters.channel,
      state: filters.state,
    })
    result.match(
      (response) => {
        setRecords(response.data)
        setPagination({
          page: response.page,
          pageSize: response.page_size,
          total: response.total,
          totalPages: response.total_pages,
        })
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load records:', error)
        setLoading(false)
      }
    )
  }, [bookId, pagination.page, pagination.pageSize, filters])

  useEffect(() => {
    loadBookDetail()
  }, [loadBookDetail])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // 处理筛选器变更
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

  // 处理页码变更
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  // 处理编辑账本
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
      },
      (error) => {
        console.error('Failed to update book:', error)
      }
    )
    setSaving(false)
  }

  // 处理删除账本
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
        console.error('Failed to delete book:', error)
      }
    )
    setDeleting(false)
  }

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
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">账本不存在</div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {book.title}
            </h1>
            {book.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {book.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </Button>
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
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="w-16 h-16 mb-4 text-gray-400">
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
          <p className="text-gray-600 dark:text-gray-400 mb-2">暂无记账记录</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            点击上方按钮添加第一条记录
          </p>
        </div>
      ) : (
        <RecordListTable records={records} loading={loading} />
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

      {/* 删除确认对话框 */}
      {book && (
        <DeleteBookConfirmDialog
          open={deleteDialogOpen}
          book={{
            title: book.title,
            recordCount: book.record_count,
          }}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteBook}
          loading={deleting}
        />
      )}
    </div>
  )
}

const PaginationEllipsis = () => (
  <span className="flex h-8 w-8 items-center justify-center">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zM17.25 12a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  </span>
)

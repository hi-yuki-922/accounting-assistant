/**
 * 账本列表页面
 * 展示所有账本，支持创建、编辑、删除、拖拽排序
 */

import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { accountingBook } from '@/api/commands/accounting-book'
import type { AccountingBook } from '@/api/commands/accounting-book/type'
import { DEFAULT_BOOK_ID } from '@/api/commands/accounting-book/type'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

import { BookCard } from './components/book-card'
import { CreateEditBookDialog } from './components/create-edit-book-dialog'
import { DeleteBookConfirmDialog } from './components/delete-book-confirm-dialog'

type SortableBookCardProps = {
  book: AccountingBook
  isDefault: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  isSortingMode: boolean
}

const SortableBookCard = ({
  book,
  isDefault,
  onClick,
  onEdit,
  onDelete,
  isSortingMode,
}: SortableBookCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: book.id,
    disabled: isDefault || !isSortingMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <BookCard
        book={book}
        isDefault={isDefault}
        onClick={isSortingMode ? undefined : onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        attributes={isSortingMode ? attributes : undefined}
        listeners={isSortingMode ? listeners : undefined}
        isSortingMode={isSortingMode && !isDefault}
      />
    </div>
  )
}

export const BooksPage = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState<AccountingBook[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<AccountingBook | null>(null)
  const [deletingBook, setDeletingBook] = useState<AccountingBook | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isSortingMode, setIsSortingMode] = useState(false)

  // 读取排序配置
  const loadBookOrder = useCallback(() => {
    const order = localStorage.getItem('book_order')
    if (order) {
      try {
        return JSON.parse(order) as number[]
      } catch {
        return null
      }
    }
    return null
  }, [])

  // 保存排序配置
  const saveBookOrder = useCallback((order: number[]) => {
    localStorage.setItem('book_order', JSON.stringify(order))
  }, [])

  // 加载账本列表
  const loadBooks = useCallback(async () => {
    const result = await accountingBook.getAll()
    result.match(
      (loadedBooks) => {
        // 应用自定义排序
        const customOrder = loadBookOrder()
        if (customOrder) {
          const orderMap = new Map(customOrder.map((id, index) => [id, index]))
          loadedBooks.sort((a, b) => {
            const aOrder = orderMap.get(a.id) ?? Infinity
            const bOrder = orderMap.get(b.id) ?? Infinity
            return aOrder - bOrder
          })
        } else {
          // 默认按创建时间倒序
          loadedBooks.sort(
            (a, b) =>
              new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
          )
        }

        // 确保默认账本排在最后
        const defaultBook = loadedBooks.find((b) => b.id === DEFAULT_BOOK_ID)
        const otherBooks = loadedBooks.filter((b) => b.id !== DEFAULT_BOOK_ID)
        setBooks([...otherBooks, ...(defaultBook ? [defaultBook] : [])])
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load books:', error)
        setLoading(false)
      }
    )
  }, [loadBookOrder])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  // dnd-kit 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 切换排序模式
  const handleToggleSortingMode = () => {
    setIsSortingMode((prev) => !prev)
  }

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = books.findIndex((b) => b.id === active.id)
    const newIndex = books.findIndex((b) => b.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const newBooks = [...books]
    const [movedBook] = newBooks.splice(oldIndex, 1)
    newBooks.splice(newIndex, 0, movedBook)

    setBooks(newBooks)

    // 保存排序配置（排除默认账本）
    const order = newBooks
      .filter((b) => b.id !== DEFAULT_BOOK_ID)
      .map((b) => b.id)
    saveBookOrder(order)
  }

  // 处理创建账本
  const handleCreateBook = async (data: {
    title: string
    description: string
    icon: string
  }) => {
    setSaving(true)
    const result = await accountingBook.create(data)
    result.match(
      () => {
        void loadBooks()
        setCreateDialogOpen(false)
      },
      (error) => {
        console.error('Failed to create book:', error)
      }
    )
    setSaving(false)
  }

  // 处理编辑账本
  const handleEditBook = async (data: {
    title: string
    description: string
    icon: string
  }) => {
    if (!editingBook) {
      return
    }

    setSaving(true)
    const result = await accountingBook.update({ id: editingBook.id, ...data })
    result.match(
      () => {
        void loadBooks()
        setEditDialogOpen(false)
        setEditingBook(null)
      },
      (error) => {
        console.error('Failed to update book:', error)
      }
    )
    setSaving(false)
  }

  // 处理删除账本
  const handleDeleteBook = async () => {
    if (!deletingBook) {
      return
    }

    setDeleting(true)
    const result = await accountingBook.delete(deletingBook.id)
    result.match(
      () => {
        void loadBooks()
        setDeleteDialogOpen(false)
        setDeletingBook(null)
      },
      (error) => {
        console.error('Failed to delete book:', error)
      }
    )
    setDeleting(false)
  }

  // 点击卡片跳转到详情页
  const handleCardClick = (book: AccountingBook) => {
    navigate({ to: '/books/$bookId', params: { bookId: book.id.toString() } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          账本管理
        </h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              排序模式
            </span>
            <Switch
              checked={isSortingMode}
              onCheckedChange={handleToggleSortingMode}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isSortingMode ? '开启' : '关闭'}
            </span>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建账本
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={books.map((b) => b.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map((book) => (
              <SortableBookCard
                key={book.id}
                book={book}
                isDefault={book.id === DEFAULT_BOOK_ID}
                onClick={() => handleCardClick(book)}
                onEdit={() => {
                  setEditingBook(book)
                  setEditDialogOpen(true)
                }}
                onDelete={() => {
                  setDeletingBook(book)
                  setDeleteDialogOpen(true)
                }}
                isSortingMode={isSortingMode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 创建账本对话框 */}
      <CreateEditBookDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onConfirm={handleCreateBook}
        loading={saving}
      />

      {/* 编辑账本对话框 */}
      {editingBook && (
        <CreateEditBookDialog
          open={editDialogOpen}
          book={editingBook}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingBook(null)
          }}
          onConfirm={handleEditBook}
          loading={saving}
        />
      )}

      {/* 删除确认对话框 */}
      {deletingBook && (
        <DeleteBookConfirmDialog
          open={deleteDialogOpen}
          book={{
            title: deletingBook.title,
            recordCount: deletingBook.record_count,
          }}
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeletingBook(null)
          }}
          onConfirm={handleDeleteBook}
          loading={deleting}
        />
      )}
    </div>
  )
}

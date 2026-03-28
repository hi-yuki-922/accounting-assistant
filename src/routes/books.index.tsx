/**
 * 账本列表页面（索引路由）
 * 当访问 /books 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { BooksPage } from '@/pages/books/books-page'

export const Route = createFileRoute('/books/')({
  component: BooksPage,
})

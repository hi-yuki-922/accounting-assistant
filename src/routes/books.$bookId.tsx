/**
 * 账本详情页面路由
 * 当访问 /books/:bookId 时显示此页面
 */

import { createFileRoute } from '@tanstack/react-router'

import { BookDetailPage } from '@/pages/books/book-detail-page'

export const Route = createFileRoute('/books/$bookId')({
  component: BookDetailPage,
})

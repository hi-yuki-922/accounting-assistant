export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

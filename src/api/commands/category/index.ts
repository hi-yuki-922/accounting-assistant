import { tryCMD } from '@/lib'

import type { Category, CreateCategoryDto, UpdateCategoryDto } from './type'
export * from './type'

export const createCategory = (data: CreateCategoryDto) =>
  tryCMD<Category>('create_category', { input: data })

export const updateCategory = (data: UpdateCategoryDto) =>
  tryCMD<Category>('update_category', { input: data })

export const deleteCategory = (id: number) =>
  tryCMD<boolean>('delete_category', { id })

export const getAllCategories = () => tryCMD<Category[]>('get_all_categories')

export const getCategoryById = (id: number) =>
  tryCMD<Category>('get_category_by_id', { id })

export const categoryApi = {
  create: createCategory,
  delete: deleteCategory,
  getAll: getAllCategories,
  getById: getCategoryById,
  update: updateCategory,
}

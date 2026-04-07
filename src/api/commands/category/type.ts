export type Category = {
  id: number
  name: string
  sellBookId: number
  purchaseBookId: number
  remark?: string
  createAt: string
}

export type CreateCategoryDto = {
  name: string
  sellBookId: number
  purchaseBookId: number
  remark?: string
}

export type UpdateCategoryDto = {
  id: number
  name?: string
  sellBookId?: number
  purchaseBookId?: number
  remark?: string | null
}

import { ReactNode } from "react"

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T, index: number) => ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    totalElements: number
    onPageSizeChange?: (size: number) => void
  }
  actions?: ReactNode
  filters?: ReactNode
  leftToolbar?: ReactNode
  advancedFilters?: ReactNode
  onRowClick?: (item: T) => void
  renderExpansion?: (item: T) => ReactNode
  emptyState?: ReactNode
}

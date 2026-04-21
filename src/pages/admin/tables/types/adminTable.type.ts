export type TableStatus = 'FREE' | 'OCCUPIED' | 'PAYMENT_REQUESTED' | 'CLEANING'

export const TABLE_STATUS = {
  FREE: 'FREE',
  OCCUPIED: 'OCCUPIED',
  PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
  CLEANING: 'CLEANING',
} as const

export interface ITable {
  id: string
  number: number
  name: string | null
  status: TableStatus
  capacity: number
  qrUrl: string | null
  active: boolean
}

export interface IPosTable {
  id: string
  number: number
  name: string | null
  status: TableStatus
  capacity: number
  currentSessionId: string | null
  currentSessionToken: string | null
  totalAmount: number
  openedAt?: string
}

export interface ITableForm {
  number: number
  name: string
  capacity: number
}

export interface ITableActionForm {
  sourceTableId: string
  targetTableId: string
}

export interface IMergeTableForm {
  sourceTableIds: string[]
  targetTableId: string
}

export interface ITableFilters {
  keyword?: string
  status?: TableStatus | ''
  active?: boolean
  page: number
  size: number
}


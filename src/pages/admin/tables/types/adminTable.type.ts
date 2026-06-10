export type TableStatus = 'FREE' | 'OCCUPIED' | 'PAYMENT_REQUESTED' | 'CLEANING' | 'MERGED' | 'RESERVED'

export const TABLE_STATUS = {
  FREE: 'FREE',
  OCCUPIED: 'OCCUPIED',
  PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
  CLEANING: 'CLEANING',
  MERGED: 'MERGED',
  RESERVED: 'RESERVED',
} as const

export interface ITable {
  id: string
  number: number
  name: string | null
  status: TableStatus
  capacity: number
  qrUrl: string | null
  active: boolean
  zone: string | null
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
  parentTableId?: string | null
  parentTableNumber?: number | null
  zone?: string | null
}

export interface ITableForm {
  number: number
  name: string
  capacity: number
  zone: string
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


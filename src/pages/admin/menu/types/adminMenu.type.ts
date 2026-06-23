export interface ICategory {
  id: string
  name: string
  imageUrl?: string
  displayOrder: number
  isActive: boolean
  taxRate?: number
}

export interface ICategoryRequest {
  name: string
  imageUrl?: string
  displayOrder?: number
  taxRate?: number
}

export interface IOption {
  id?: string
  name: string
  extraPrice: number
  isAvailable: boolean
}

export interface IOptionGroup {
  id?: string
  name: string
  type: 'SINGLE' | 'MULTI'
  isRequired: boolean
  displayOrder: number
  options: IOption[]
}

export interface IMenuItem {
  id: string
  name: string
  categoryId?: string
  categoryName?: string
  basePrice: number
  taxRate?: number
  salePrice?: number
  saleStartAt?: string
  saleEndAt?: string
  description?: string
  station?: 'HOT' | 'COLD' | 'DRINK' | 'RETAIL'
  isAvailable: boolean
  isFeatured: boolean
  isActive: boolean
  imageUrl?: string
  optionGroups?: IOptionGroup[]
}

export interface IMenuItemRequest {
  name: string
  categoryId: string
  basePrice: number
  taxRate?: number
  description?: string
  station: 'HOT' | 'COLD' | 'DRINK' | 'RETAIL'
  isFeatured: boolean
  isAvailable: boolean
  imageUrl?: string | null
  optionGroups?: IOptionGroupRequest[]
}

export interface IOptionRequest {
  name: string
  extraPrice: number
}

export interface IOptionGroupRequest {
  name: string
  type: 'SINGLE' | 'MULTI'
  isRequired: boolean
  displayOrder: number
  options: IOptionRequest[]
}

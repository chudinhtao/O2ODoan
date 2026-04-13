export interface IApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  timestamp: string
}

export interface IPageResponse<T> {
  content:       T[]
  totalElements: number
  totalPages:    number
  page:          number
  size:          number
  last:          boolean
}

export interface IApiError {
  status:  number
  message: string
  errors?: Record<string, string>
}

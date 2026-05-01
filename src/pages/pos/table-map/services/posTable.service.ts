import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { IPosTable, ITableActionForm, IMergeTableForm } from '@/pages/admin/tables/types/adminTable.type'

export const posTableService = {
  getTables: () => http.get<IApiResponse<IPosTable[]>>('/tables/pos'),
  getActiveTakeaways: () => http.get<IApiResponse<IPosTable[]>>('/orders/takeaway/active'),
  openTable: (tableId: string) => http.post<IApiResponse<{ sessionId: string }>>(`/sessions/open/manual/${tableId}`),
  markCleaned: (tableId: string) => http.patch<IApiResponse<null>>(`/tables/${tableId}/clean-done`),
  mergeTables: (data: IMergeTableForm) => http.post<IApiResponse<null>>('/tables/merge', data),
  transferTable: (data: ITableActionForm) => http.post<IApiResponse<null>>('/tables/transfer', data),
}

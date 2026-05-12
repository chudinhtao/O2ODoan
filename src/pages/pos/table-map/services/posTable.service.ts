import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { unwrapApiData, unwrapApiResponse } from '@/shared/utils/apiResponse'
import { IPosTable, ITableActionForm, IMergeTableForm } from '@/pages/admin/tables/types/adminTable.type'

export const posTableService = {
  getTables: () => http.get<IApiResponse<IPosTable[]>>('/tables/pos').then(unwrapApiData),
  getActiveTakeaways: () => http.get<IApiResponse<IPosTable[]>>('/orders/takeaway/active').then(unwrapApiData),
  openTable: (tableId: string) => http.post<IApiResponse<{ sessionId: string }>>(`/sessions/open/manual/${tableId}`).then(unwrapApiResponse),
  markCleaned: (tableId: string) => http.patch<IApiResponse<null>>(`/tables/${tableId}/clean-done`).then(unwrapApiResponse),
  mergeTables: (data: IMergeTableForm) => http.post<IApiResponse<null>>('/tables/merge', data).then(unwrapApiResponse),
  transferTable: (data: ITableActionForm) => http.post<IApiResponse<null>>('/tables/transfer', data).then(unwrapApiResponse),
}

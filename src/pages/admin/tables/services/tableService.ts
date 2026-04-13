import http from '@/services/interceptor'
import type { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { ITable, ITableForm, ITableFilters } from '../types/adminTable.type'

class AdminTableService {
  async getTables(params: ITableFilters): Promise<IPageResponse<ITable>> {
    const { page, size, keyword, status, active: isActive } = params
    const response = await http.get<IApiResponse<IPageResponse<ITable>>>(
      API_ROUTES.table.root,
      { params: { page, size, keyword: keyword || undefined, status: status || undefined, isActive } }
    )
    const data = response.data.data
    return {
      ...data,
      content: data.content.map(t => ({
        ...t,
        active: (t as any).isActive ?? t.active
      }))
    }
  }

  async createTable(data: ITableForm): Promise<ITable> {
    const response = await http.post<IApiResponse<ITable>>(
      API_ROUTES.adminTable.root,
      data
    )
    const t = response.data.data
    return { ...t, active: (t as any).isActive ?? t.active }
  }

  async updateTable(id: string, data: ITableForm): Promise<ITable> {
    const response = await http.put<IApiResponse<ITable>>(
      API_ROUTES.adminTable.byId(id),
      data
    )
    const t = response.data.data
    return { ...t, active: (t as any).isActive ?? t.active }
  }

  async generateQr(id: string): Promise<ITable> {
    const response = await http.post<IApiResponse<ITable>>(
      API_ROUTES.adminTable.generateQr(id)
    )
    const t = response.data.data
    return { ...t, active: (t as any).isActive ?? t.active }
  }

  async disableQr(id: string): Promise<ITable> {
    const response = await http.patch<IApiResponse<ITable>>(
      API_ROUTES.adminTable.disableQr(id)
    )
    const t = response.data.data
    return { ...t, active: (t as any).isActive ?? t.active }
  }

  async markCleaned(id: string): Promise<void> {
    await http.patch<IApiResponse<void>>(API_ROUTES.table.cleanDone(id))
  }

  async deleteTable(id: string): Promise<void> {
    await http.delete<IApiResponse<void>>(API_ROUTES.adminTable.byId(id))
  }

  async hardDeleteTable(id: string): Promise<void> {
    await http.delete<IApiResponse<void>>(API_ROUTES.adminTable.hardDelete(id))
  }

  async toggleActive(id: string): Promise<ITable> {
    const response = await http.patch<IApiResponse<ITable>>(
      API_ROUTES.adminTable.toggleActive(id)
    )
    const t = response.data.data
    return { ...t, active: (t as any).isActive ?? t.active }
  }

  async mergeTable(sourceTableId: string, targetTableId: string): Promise<void> {
    await http.post<IApiResponse<void>>(API_ROUTES.table.merge, { sourceTableId, targetTableId })
  }

  async transferTable(sourceTableId: string, targetTableId: string): Promise<void> {
    await http.post<IApiResponse<void>>(API_ROUTES.table.transfer, { sourceTableId, targetTableId })
  }
}

export const adminTableService = new AdminTableService()

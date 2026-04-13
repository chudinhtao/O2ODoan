import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import type { 
  IRevenueReport, 
  ITopItemTarget, 
  ISourceReport, 
  IHourlyTraffic, 
  ITableUsage, 
  ICashierShiftReport 
} from '../types/report.type'

export const reportService = {
  getRevenue: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IRevenueReport[]>>(API_ROUTES.report.revenue, { params: { from, to } })
    return res.data.data
  },
  
  getTopItems: async (from: string, to: string, limit: number = 10) => {
    const res = await http.get<IApiResponse<ITopItemTarget[]>>(API_ROUTES.report.topItems, { params: { from, to, limit } })
    return res.data.data
  },

  getBySource: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<ISourceReport[]>>(API_ROUTES.report.bySource, { params: { from, to } })
    return res.data.data
  },

  getHourlyTraffic: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IHourlyTraffic[]>>(API_ROUTES.report.byHour, { params: { from, to } })
    return res.data.data
  },

  getTableUsage: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<ITableUsage[]>>(API_ROUTES.report.tables, { params: { from, to } })
    return res.data.data
  },

  getCashierShift: async (shiftDate: string) => {
    const res = await http.get<IApiResponse<ICashierShiftReport>>(API_ROUTES.report.cashierShift, { params: { shiftDate } })
    return res.data.data
  }
}

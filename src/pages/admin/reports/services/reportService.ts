import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import type {
  IRevenueReport,
  ITopItemTarget,
  ISourceReport,
  IHourlyTraffic,
  ITableUsage,
  ICashierShiftReport,
  IPromotionEffectiveness,
  IStaffCallStats,
  IKitchenPerformance,
  ICancelledOrderDrilldown
} from '../types/report.type'

export const reportService = {
  getRevenue: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IRevenueReport[]>>(API_ROUTES.report.revenue, { params: { from, to } })
    return res.data.data
  },

  // F2: Thêm sortBy param (QUANTITY | REVENUE)
  getTopItems: async (from: string, to: string, limit: number = 10, sortBy: 'QUANTITY' | 'REVENUE' = 'QUANTITY') => {
    const res = await http.get<IApiResponse<ITopItemTarget[]>>(API_ROUTES.report.topItems, {
      params: { from, to, limit, sortBy }
    })
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
  },

  // N2: Endpoint mới — hiệu quả khuyến mãi
  getPromotionEffectiveness: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IPromotionEffectiveness[]>>(
      API_ROUTES.report.promotionEffectiveness,
      { params: { from, to } }
    )
    return res.data.data
  },

  // N3: Endpoint mới — thống kê gọi nhân viên
  getStaffCallStats: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IStaffCallStats[]>>(
      API_ROUTES.report.staffCalls,
      { params: { from, to } }
    )
    return res.data.data
  },

  // 1.4: Hieu suat bep
  getKitchenPerformance: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IKitchenPerformance[]>>(
      API_ROUTES.report.kitchenPerformance,
      { params: { from, to } }
    )
    return res.data.data
  },

  // 1.4: Chi tiet don huy
  getCancelledDrilldown: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<ICancelledOrderDrilldown[]>>(
      API_ROUTES.report.cancelledDrilldown,
      { params: { from, to } }
    )
    return res.data.data
  }
}

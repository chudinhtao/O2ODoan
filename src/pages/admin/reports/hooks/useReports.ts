import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export const REPORT_KEYS = {
  all: ['reports'] as const,
  revenue: (from: string, to: string) => [...REPORT_KEYS.all, 'revenue', from, to] as const,
  profitLoss: (from: string, to: string) => [...REPORT_KEYS.all, 'profitLoss', from, to] as const,
  inventoryVariance: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'invVariance', from, to, page, size] as const,
  topItems: (from: string, to: string, sortBy: string, page?: number, size?: number) =>
    [...REPORT_KEYS.all, 'topItems', from, to, sortBy, page, size] as const,
  source: (from: string, to: string) => [...REPORT_KEYS.all, 'source', from, to] as const,
  hourly: (from: string, to: string) => [...REPORT_KEYS.all, 'hourly', from, to] as const,
  tables: (from: string, to: string) => [...REPORT_KEYS.all, 'tables', from, to] as const,
  shift: (date: string) => [...REPORT_KEYS.all, 'shift', date] as const,
  promotionEffectiveness: (from: string, to: string, page?: number, size?: number) =>
    [...REPORT_KEYS.all, 'promotionEffectiveness', from, to, page, size] as const,
  staffCalls: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'staffCalls', from, to, page, size] as const,
  kitchenPerformance: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'kitchenPerf', from, to, page, size] as const,
  cancelledDrilldown: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'cancelled', from, to, page, size] as const,
  chefPerformance: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'chef', from, to, page, size] as const,
  serverPerformance: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'server', from, to, page, size] as const,
  categorySales: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'categorySales', from, to, page, size] as const,
  staffTimesheet: (from: string, to: string, page?: number, size?: number) => [...REPORT_KEYS.all, 'timesheet', from, to, page, size] as const,
  reservations: (from: string, to: string) => [...REPORT_KEYS.all, 'reservations', from, to] as const,
}

export function useRevenueReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.revenue(from, to),
    queryFn: () => reportService.getRevenue(from, to),
    enabled: !!from && !!to
  })
}

export function useProfitLossReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.profitLoss(from, to),
    queryFn: () => reportService.getProfitLoss(from, to),
    enabled: !!from && !!to
  })
}

export function useInventoryVarianceReport(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.inventoryVariance(from, to, page, size),
    queryFn: () => reportService.getInventoryVariance(from, to, page, size),
    enabled: !!from && !!to
  })
}

// F2: Thêm sortBy — 'QUANTITY' (mặc định) | 'REVENUE'
export function useTopItemsReport(
  from: string,
  to: string,
  sortBy: 'QUANTITY' | 'REVENUE' = 'QUANTITY',
  page: number = 0,
  size: number = 10
) {
  return useQuery({
    queryKey: REPORT_KEYS.topItems(from, to, sortBy, page, size),
    queryFn: () => reportService.getTopItems(from, to, sortBy, page, size),
    enabled: !!from && !!to
  })
}

export function useSourceReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.source(from, to),
    queryFn: () => reportService.getBySource(from, to),
    enabled: !!from && !!to
  })
}

export function useHourlyTraffic(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.hourly(from, to),
    queryFn: () => reportService.getHourlyTraffic(from, to),
    enabled: !!from && !!to
  })
}

export function useTableUsageReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.tables(from, to),
    queryFn: () => reportService.getTableUsage(from, to),
    enabled: !!from && !!to
  })
}

// N2: Hook mới — hiệu quả khuyến mãi
export function usePromotionEffectiveness(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.promotionEffectiveness(from, to, page, size),
    queryFn: () => reportService.getPromotionEffectiveness(from, to, page, size),
    enabled: !!from && !!to
  })
}

// N3: Hook moi — thong ke goi nhan vien
export function useStaffCallStats(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.staffCalls(from, to, page, size),
    queryFn: () => reportService.getStaffCallStats(from, to, page, size),
    enabled: !!from && !!to
  })
}

// 1.4: Hook moi — hieu suat bep
export function useKitchenPerformance(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.kitchenPerformance(from, to, page, size),
    queryFn: () => reportService.getKitchenPerformance(from, to, page, size),
    enabled: !!from && !!to
  })
}

// 1.4: Hook moi — chi tiet don huy
export function useCancelledDrilldown(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.cancelledDrilldown(from, to, page, size),
    queryFn: () => reportService.getCancelledDrilldown(from, to, page, size),
    enabled: !!from && !!to
  })
}

// KPI Bếp
export function useChefPerformance(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.chefPerformance(from, to, page, size),
    queryFn: () => reportService.getChefPerformance(from, to, page, size),
    enabled: !!from && !!to
  })
}

// KPI Phục vụ
export function useServerPerformance(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.serverPerformance(from, to, page, size),
    queryFn: () => reportService.getServerPerformance(from, to, page, size),
    enabled: !!from && !!to
  })
}

// Doanh thu theo danh mục
export function useCategorySales(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.categorySales(from, to, page, size),
    queryFn: () => reportService.getCategorySales(from, to, page, size),
    enabled: !!from && !!to
  })
}

// Chấm công & Năng suất (Timesheet)
export function useStaffTimesheet(from: string, to: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.staffTimesheet(from, to, page, size),
    queryFn: () => reportService.getStaffTimesheet(from, to, page, size),
    enabled: !!from && !!to
  })
}

// Thống kê Đặt Bàn & Tiền Cọc
export function useReservationReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.reservations(from, to),
    queryFn: () => reportService.getReservationReport(from, to),
    enabled: !!from && !!to
  })
}

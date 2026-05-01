export interface IRevenueReport {
  day: string;
  revenue: number;
  totalOrders: number;
  avgOrderValue: number; // F1: Giá trị đơn TB theo ngày
}

export interface ITopItemTarget {
  itemName: string;
  totalSold: number;
  revenue: number;
}

export interface ISourceReport {
  source: string;
  totalOrders: number;
  revenue: number;
  percentage: number;        // F3: % trên tổng doanh thu (tính sẵn ở BE)
  totalAllRevenue: number;   // F3: Tổng doanh thu tất cả nguồn
}

export interface IHourlyTraffic {
  hourOfDay: number;
  orderCount: number;
  revenue: number;
  avgOrderValue: number; // F4: Giá trị đơn TB theo giờ
}

export interface ITableUsage {
  tableNumber: string;
  tableName: string;
  zone: string | null;              // F5: Khu vực bàn
  capacity: number | null;          // F5: Sức chứa
  sessionsCount: number;
  totalRevenue: number;
  avgSessionMinutes: number | null; // F5: Thời gian ngồi TB (phút)
}

export interface ICashierShiftReport {
  shiftDate: string;
  totalRevenue: number;
  totalOrders: number;
  revenueByPaymentMethod: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
  cancelledOrders: number;    // F6: Số đơn bị huỷ trong ca
  cancelledRevenue: number;   // F6: Doanh thu bị mất do huỷ
}

// N2: Hiệu quả khuyến mãi — endpoint mới /api/reports/promotion-effectiveness
export interface IPromotionEffectiveness {
  promotionCode: string;
  orderCount: number;
  totalDiscountGiven: number;
  grossRevenue: number;
  avgOrderValue: number;
}

// N3: Thống kê gọi nhân viên — endpoint mới /api/reports/staff-calls
export interface IStaffCallStats {
  tableNumber: string;
  callType: 'BILL' | 'WATER' | 'CLEAN' | 'SUPPORT';
  callCount: number;
  avgResolveMinutes: number | null;
}

// 1.4: Hieu suat bep — endpoint /api/reports/kitchen-performance
export interface IKitchenPerformance {
  itemName: string;
  totalTickets: number;
  avgPrepMinutes: number | null;
  lateTickets: number;
  lateRate: number;
}

// 1.4: Chi tiet don huy — endpoint /api/reports/cancelled-drilldown
export interface ICancelledOrderDrilldown {
  cancellationReason: string;
  cancelCount: number;
  cancelledRevenue: number;
  cancelRate: number;
}

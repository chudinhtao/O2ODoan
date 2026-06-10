export interface IRevenueReport {
  day: string;
  revenue: number; // Gross
  taxAmount: number;
  netRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
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

// New: Profit & Loss
export interface IProfitLossReport {
  startDate: string;
  endDate: string;
  totalRevenue: number; // Net Revenue (if BE returns totalNetRevenue in totalRevenue field, but BE usually sends it as totalRevenue)
  totalTax: number;
  totalCogs: number;
  totalWaste: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

// New: Inventory Variance (TvA)
export interface IInventoryVarianceReport {
  id?: string | number;
  ingredientId: string;
  ingredientName: string;
  uomName: string;
  theoreticalUsage: number;
  actualUsage: number;
  variance: number;
  varianceValue: number;
}

export interface IChefPerformance {
  chefId: string;
  chefName: string;
  totalItemsPrepared: number;
  avgPrepMinutes: number;
  lateItemCount: number;
  lateRate: number;
}

export interface IServerPerformance {
  serverId: string;
  serverName: string;
  totalCallsResolved: number;
  avgResponseSeconds: number;
  avgResolutionMinutes: number;
  totalItemsServed: number;
  avgDeliverySeconds: number;
}

export interface ICategorySales {
  categoryId: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number; // Gross
  totalTax: number;
  totalNetRevenue: number;
  revenuePercentage: number;
}

export interface IStaffTimesheet {
  staffId: string;
  staffName: string;
  role: string;
  totalShifts: number;
  totalWorkingHours: number;
  totalRevenue: number;
  revenuePerHour: number;
  itemsPrepared: number;    // KITCHEN only
  callsResolved: number;    // SERVER only
}

export interface IDailyReservationTrend {
  day: string;
  totalReservations: number;
  totalCompleted: number;
  totalCancelled: number;
}

export interface IReservationReport {
  totalReservations: number;
  totalCompleted: number;
  totalCancelled: number;
  totalNoShow: number;
  totalDeposits: number;
  pendingRefund: number;
  refunded: number;
  forfeited: number;
  dailyTrend: IDailyReservationTrend[];
}

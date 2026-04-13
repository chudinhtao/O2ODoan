export interface IRevenueReport {
  day: string;
  revenue: number;
  totalOrders: number;
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
}

export interface IHourlyTraffic {
  hourOfDay: number;
  orderCount: number;
  revenue: number;
}

export interface ITableUsage {
  tableNumber: string;
  tableName: string;
  sessionsCount: number;
  totalRevenue: number;
}

export interface ICashierShiftReport {
  shiftDate: string;
  totalRevenue: number;
  totalOrders: number;
  revenueByPaymentMethod: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
}

export interface ISalesReportStats {
  totalRevenue: number;
  totalQuantitySold: number;
  totalOrders: number;
}

export interface ISalesReportProduct {
  _id: string;
  name: string;
  revenue: number;
  quantitySold: number;
}

export interface ISalesReportClient {
  _id: string;
  name: string;
  mobile: string;
  totalSpent: number;
  totalOrders: number;
  totalQuantity: number;
}

export interface ISalesReportMonth {
  _id: { year: number; month: number };
  totalRevenue: number;
  totalQuantity: number;
}

export interface ISalesReport {
  overallStats: ISalesReportStats[];
  topProducts: ISalesReportProduct[];
  topClients: ISalesReportClient[];
  monthlySales: ISalesReportMonth[];
}

export interface ForecastData {
  date: string;
  predicted_revenue: number;
  predicted_expenses: number;
}

export interface YearOverYearData {
  month: string;
  currentYear: {
    revenue: number;
    expenses: number;
  };
  previousYear: {
    revenue: number;
    expenses: number;
  };
  percentageChange: {
    revenue: number;
    expenses: number;
  };
}

export interface ProfitMarginData {
  period: string;
  revenue: number;
  costs: number;
  profitMargin: number;
  profitAmount: number;
}
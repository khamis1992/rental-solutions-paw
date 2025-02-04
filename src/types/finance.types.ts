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

export interface AnalyticsInsight {
  id: string;
  category: string;
  insight: string;
  data_points: {
    roi_percentage?: number;
    net_profit?: number;
    [key: string]: any;
  };
  confidence_score: number;
  analyzed_at: string;
  created_at: string;
  status: string;
  priority: number;
  action_taken: boolean;
  recommendation?: string;
}

export interface ReportSchedule {
  id: string;
  report_type: string;
  frequency: string;
  recipients: string[];
  format: string;
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataComponent {
  type: string;
  data: any;
  config?: any;
}

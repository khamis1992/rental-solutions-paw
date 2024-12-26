export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  description: string;
  transaction_date: string;
  receipt_url: string | null;
  reference_type: string | null;
  reference_id: string | null;
  recurring_schedule: any | null;
  status: string;
  created_at: string;
  updated_at: string;
  cost_type: string | null;
  is_recurring: boolean;
  recurrence_interval: unknown;
  accounting_categories: {
    name: string;
    type: string;
  } | null;
}

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
export interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: any;
}

export interface SearchFilters {
  dateRange: { from: Date; to: Date } | null;
  status: string[];
  type: string[];
}
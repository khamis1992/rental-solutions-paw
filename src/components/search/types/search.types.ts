export interface SearchFilters {
  entityType: 'customer' | 'vehicle' | 'agreement' | 'all';
  keyword: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
}

export interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}
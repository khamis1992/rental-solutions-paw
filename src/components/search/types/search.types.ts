export type EntityType = 'customer' | 'vehicle' | 'agreement' | 'all';

export interface SearchFilters {
  entityType: EntityType;
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

export interface SearchResult {
  id: string;
  full_name?: string;
  phone_number?: string;
  agreement_number?: string;
  status?: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
}
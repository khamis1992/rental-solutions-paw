export interface SearchFilters {
  entityType: "customers" | "rentals" | "vehicles";
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  keyword: string;
}

export interface AdvancedSearchProps {
  onResultSelect?: (result: any) => void;
}
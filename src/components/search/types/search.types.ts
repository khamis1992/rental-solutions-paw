export interface SearchFilters {
  entityType: "profiles" | "leases" | "vehicles";
  keyword: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface SearchResultsProps {
  isLoading?: boolean;
  error?: Error | null;
  searchQuery: string;
  searchResults: any[];
  handleSelect: (type: string, id: string) => void;
}
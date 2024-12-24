export interface SearchFilters {
  entityType: "profiles" | "leases" | "vehicles";
  status?: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  keyword: string;
}

export interface SearchResultsProps {
  data: any[];
  entityType: "profiles" | "leases" | "vehicles";
  isLoading?: boolean;
  error?: Error | null;
}
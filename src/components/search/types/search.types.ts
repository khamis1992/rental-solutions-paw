export interface SearchFilters {
  entityType: "profiles" | "leases" | "vehicles";
  keyword: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
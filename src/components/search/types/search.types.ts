import { DateRange } from "@/components/ui/date-range-picker";

export type SearchEntityType = "profiles" | "leases" | "vehicles";

export interface SearchFilters {
  entityType: SearchEntityType;
  keyword: string;
  status?: string;
  dateRange?: DateRange;
}
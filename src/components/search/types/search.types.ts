import { DateRange as CalendarDateRange } from "react-day-picker";

export type SearchEntityType = "profiles" | "leases" | "vehicles";

export interface SearchFilters {
  entityType: SearchEntityType;
  keyword: string;
  status?: string;
  dateRange?: CalendarDateRange;
}
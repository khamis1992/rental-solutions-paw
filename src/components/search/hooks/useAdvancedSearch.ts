import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { SearchFilters } from "../types/search.types";

export const useAdvancedSearch = (filters: SearchFilters) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["advanced-search", filters],
    queryFn: async () => {
      try {
        let query;
        
        switch (filters.entityType) {
          case "customers":
            query = supabase.from("profiles")
              .select("*")
              .eq("role", "customer");
            break;
          case "rentals":
            query = supabase.from("leases")
              .select("*");
            break;
          case "vehicles":
            query = supabase.from("vehicles")
              .select("*");
            break;
          default:
            throw new Error("Invalid entity type");
        }

        if (filters.keyword) {
          switch (filters.entityType) {
            case "customers":
              query = query.or(`full_name.ilike.%${filters.keyword}%,phone_number.ilike.%${filters.keyword}%`);
              break;
            case "rentals":
              query = query.or(`agreement_number.ilike.%${filters.keyword}%`);
              break;
            case "vehicles":
              query = query.or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%,license_plate.ilike.%${filters.keyword}%`);
              break;
          }
        }

        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        if (filters.dateRange?.from && filters.dateRange?.to) {
          const dateField = filters.entityType === "rentals" ? "start_date" : "created_at";
          query = query
            .gte(dateField, filters.dateRange.from.toISOString())
            .lte(dateField, filters.dateRange.to.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Search error:", error);
        throw error;
      }
    },
    enabled: !!filters.keyword || !!filters.status || !!(filters.dateRange?.from && filters.dateRange?.to),
  });

  return {
    searchResults,
    isLoading,
    error,
    isFiltersOpen,
    setIsFiltersOpen
  };
};
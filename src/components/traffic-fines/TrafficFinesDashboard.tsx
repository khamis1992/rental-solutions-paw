import { useQuery } from "@tanstack/react-query";
import { TrafficFineStats } from "./TrafficFineStats";
import { TrafficFineImport } from "./TrafficFineImport";
import { TrafficFinesList } from "./TrafficFinesList";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function TrafficFinesDashboard() {
  // Add state for the required props
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("violation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: finesCount, refetch } = useQuery({
    queryKey: ["traffic-fines-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Traffic Fines Management</h1>
        <ErrorBoundary>
          <TrafficFineStats paymentCount={finesCount || 0} />
        </ErrorBoundary>
      </div>
      
      <ErrorBoundary>
        <TrafficFineImport />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <TrafficFinesList 
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </ErrorBoundary>
    </div>
  );
}
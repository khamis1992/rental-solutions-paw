import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { MaintenanceTableHeader } from "./table/MaintenanceTableHeader";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";
import { MaintenanceFilters } from "./MaintenanceFilters";

export const MaintenanceList = () => {
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
    dateRange: "all",
    vehicleStatus: "all"
  });

  const { data: maintenance, isLoading } = useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            id,
            make,
            model,
            license_plate,
            status
          ),
          profiles (
            id,
            full_name
          )
        `);

      if (filters.status !== "all") {
        query = query.eq("status", filters.status as "scheduled" | "in_progress" | "completed" | "cancelled");
      }

      if (filters.serviceType !== "all") {
        query = query.eq("service_type", filters.serviceType);
      }

      if (filters.vehicleStatus !== "all") {
        query = query.eq("vehicles.status", filters.vehicleStatus);
      }

      if (filters.dateRange !== "all") {
        const now = new Date();
        let startDate;

        switch (filters.dateRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "this_week":
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            break;
          case "this_month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "last_month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            query = query
              .gte("scheduled_date", startDate.toISOString())
              .lte("scheduled_date", endDate.toISOString());
            break;
          default:
            break;
        }

        if (filters.dateRange !== "last_month") {
          query = query.gte("scheduled_date", startDate.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to fetch maintenance records");
        throw error;
      }

      console.log("Maintenance data:", data); // Debug log
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  console.log("Rendered maintenance:", maintenance); // Debug log

  return (
    <div className="space-y-4">
      <MaintenanceFilters
        statusFilter={filters.status}
        serviceTypeFilter={filters.serviceType}
        dateRangeFilter={filters.dateRange}
        vehicleStatusFilter={filters.vehicleStatus}
        onFilterChange={setFilters}
      />

      <div className="rounded-md border">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {maintenance?.map((record) => (
              <MaintenanceTableRow key={record.id} record={record} />
            ))}
            {(!maintenance || maintenance.length === 0) && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                  No maintenance records found
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
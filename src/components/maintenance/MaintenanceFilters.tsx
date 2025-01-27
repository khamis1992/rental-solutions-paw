import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceFiltersProps {
  statusFilter: string;
  serviceTypeFilter: string;
  dateRangeFilter: string;
  vehicleStatusFilter: string;
  onFilterChange: (filters: {
    status: string;
    serviceType: string;
    dateRange: string;
    vehicleStatus: string;
  }) => void;
}

export const MaintenanceFilters = ({
  statusFilter,
  serviceTypeFilter,
  dateRangeFilter,
  vehicleStatusFilter,
  onFilterChange,
}: MaintenanceFiltersProps) => {
  const { data: vehicleStatuses } = useQuery({
    queryKey: ["vehicle-statuses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_statuses")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onFilterChange({
              status: value,
              serviceType: serviceTypeFilter,
              dateRange: dateRangeFilter,
              vehicleStatus: vehicleStatusFilter,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Select
          value={serviceTypeFilter}
          onValueChange={(value) =>
            onFilterChange({
              status: statusFilter,
              serviceType: value,
              dateRange: dateRangeFilter,
              vehicleStatus: vehicleStatusFilter,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Select
          value={dateRangeFilter}
          onValueChange={(value) =>
            onFilterChange({
              status: statusFilter,
              serviceType: serviceTypeFilter,
              dateRange: value,
              vehicleStatus: vehicleStatusFilter,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Select
          value={vehicleStatusFilter}
          onValueChange={(value) =>
            onFilterChange({
              status: statusFilter,
              serviceType: serviceTypeFilter,
              dateRange: dateRangeFilter,
              vehicleStatus: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by vehicle status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicle Statuses</SelectItem>
            {vehicleStatuses?.map((status) => (
              <SelectItem key={status.id} value={status.name}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface MaintenanceFilters {
  status: string;
  serviceType: string;
  dateRange: string;
}

interface MaintenanceFiltersProps {
  filters: MaintenanceFilters;
  setFilters: (filters: MaintenanceFilters) => void;
}

export const MaintenanceFilters = ({
  filters,
  setFilters,
}: MaintenanceFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Service Type"
          value={filters.serviceType}
          onChange={(e) =>
            setFilters({ ...filters, serviceType: e.target.value })
          }
        />
      </div>
    </div>
  );
};
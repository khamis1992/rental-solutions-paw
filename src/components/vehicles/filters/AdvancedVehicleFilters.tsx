import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedVehicleFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const AdvancedVehicleFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdvancedVehicleFiltersProps) => {
  return null; // Return null since we're removing the entire component
};
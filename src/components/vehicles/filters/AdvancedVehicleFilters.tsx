export interface VehicleFilters {
  search: string;
  status: string;
  location: string;
  makeModel: string;
  yearRange: {
    from: number | null;
    to: number | null;
  };
}

interface AdvancedVehicleFiltersProps {
  onFilterChange: (filters: VehicleFilters) => void;
}

export const AdvancedVehicleFilters = ({ onFilterChange }: AdvancedVehicleFiltersProps) => {
  return null;
};
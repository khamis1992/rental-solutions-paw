import { useState } from "react";
import { VehicleGrid } from "./VehicleGrid";
import { VehicleListView } from "./table/VehicleListView";
import { AdvancedVehicleFilters, VehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/database/vehicle.types";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VehicleTablePagination } from "./table/VehicleTablePagination";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 9; // Divisible by 3 for grid layout

export const VehicleList = ({ vehicles, isLoading }: VehicleListProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({
    search: "",
    status: "all",
    location: "",
    makeModel: "",
    yearRange: {
      from: null,
      to: null,
    },
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const handleVehicleClick = (vehicleId: string) => {
    console.log("Navigating to vehicle:", vehicleId);
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleVehicleSelect = (vehicleId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    }
  };

  // Filter vehicles based on criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = filters.search === "" ||
      vehicle.make.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === "all" || vehicle.status === filters.status;

    const matchesMakeModel = filters.makeModel === "" ||
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(filters.makeModel.toLowerCase());

    return matchesSearch && matchesStatus && matchesMakeModel;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
  }

  return (
    <div className="pt-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <AdvancedVehicleFilters onFilterChange={setFilters} />
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}>
        {viewMode === 'grid' ? (
          <VehicleGrid 
            vehicles={currentVehicles} 
            onVehicleClick={handleVehicleClick}
          />
        ) : (
          <VehicleListView 
            vehicles={currentVehicles} 
            onVehicleClick={handleVehicleClick}
            selectedVehicles={selectedVehicles}
            onVehicleSelect={handleVehicleSelect}
          />
        )}
      </div>

      {filteredVehicles.length > ITEMS_PER_PAGE && (
        <VehicleTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
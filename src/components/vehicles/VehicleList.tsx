import { useState } from "react";
import { VehicleGrid } from "./VehicleGrid";
import { VehicleListView } from "./table/VehicleListView";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/database/vehicle.types";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VehicleTablePagination } from "./table/VehicleTablePagination";
import { BulkActionsMenu } from "./components/BulkActionsMenu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 9;

export const VehicleList = ({ vehicles, isLoading }: VehicleListProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
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
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleVehicleSelect = (vehicleId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .in('id', selectedVehicles);

      if (error) throw error;

      toast.success(`Successfully updated ${selectedVehicles.length} vehicles`);
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Error updating vehicles:', error);
      toast.error('Failed to update vehicles');
    }
  };

  const handleBulkMaintenance = () => {
    toast.info('Maintenance scheduling feature coming soon');
  };

  const handleBulkExport = () => {
    const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id));
    const csv = convertToCSV(selectedVehiclesData);
    downloadCSV(csv, 'vehicles-export.csv');
  };

  const handleBulkArchive = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'archived' })
        .in('id', selectedVehicles);

      if (error) throw error;

      toast.success(`Successfully archived ${selectedVehicles.length} vehicles`);
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Error archiving vehicles:', error);
      toast.error('Failed to archive vehicles');
    }
  };

  const convertToCSV = (vehicles: Vehicle[]) => {
    const headers = ['Make', 'Model', 'Year', 'License Plate', 'Status'];
    const rows = vehicles.map(v => [v.make, v.model, v.year, v.license_plate, v.status]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter vehicles based on all criteria
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !searchTerm || 
      vehicle.make.toLowerCase().includes(searchTerm) ||
      vehicle.model.toLowerCase().includes(searchTerm) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm);

    const matchesStatus = filters.status === "all" || vehicle.status === filters.status;
    
    const matchesLocation = !filters.location || 
      vehicle.location?.toLowerCase().includes(filters.location.toLowerCase());

    const matchesMakeModel = !filters.makeModel ||
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(filters.makeModel.toLowerCase());

    return matchesSearch && matchesStatus && matchesLocation && matchesMakeModel;
  });

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
        <div className="flex items-center gap-4">
          <BulkActionsMenu
            selectedCount={selectedVehicles.length}
            onUpdateStatus={handleBulkStatusUpdate}
            onScheduleMaintenance={handleBulkMaintenance}
            onExport={handleBulkExport}
            onArchive={handleBulkArchive}
            disabled={isLoading}
          />
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

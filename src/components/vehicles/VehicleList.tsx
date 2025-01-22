import { useState } from "react";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { VehicleListView } from "./table/VehicleListView";
import { BulkActionsMenu } from "./components/BulkActionsMenu";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/vehicle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleList = ({ vehicles, isLoading }: VehicleListProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDeleteVehicle = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', selectedVehicles[0]);

      if (error) throw error;

      toast.success('Vehicle deleted successfully');
      setShowDeleteDialog(false);
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .in('id', selectedVehicles);

      if (error) throw error;

      toast.success(`${selectedVehicles.length} vehicles deleted successfully`);
      setShowDeleteDialog(false);
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Error deleting vehicles:', error);
      toast.error('Failed to delete vehicles');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <AdvancedVehicleFilters 
          searchQuery={searchQuery}
          statusFilter=""
          onSearchChange={setSearchQuery}
          onStatusChange={() => {}}
        />
        {selectedVehicles.length > 0 && (
          <BulkActionsMenu
            selectedCount={selectedVehicles.length}
            onDelete={() => setShowDeleteDialog(true)}
          />
        )}
      </div>

      <VehicleListView
        vehicles={currentVehicles}
        isLoading={isLoading}
        selectedVehicles={selectedVehicles}
        onSelectionChange={setSelectedVehicles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <DeleteVehicleDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleBulkDelete}
        count={selectedVehicles.length}
      />
    </div>
  );
};
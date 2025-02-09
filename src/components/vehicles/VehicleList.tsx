
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleListView } from "./table/VehicleListView";
import { Vehicle } from "@/types/vehicle";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export const VehicleList = ({ 
  vehicles,
  isLoading 
}: {
  vehicles: Vehicle[];
  isLoading: boolean;
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isMobile = useIsMobile();

  const handleDeleteVehicle = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .in('id', selectedVehicles);

      if (error) throw error;

      toast.success(`${selectedVehicles.length} vehicle(s) deleted successfully`);
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
      <VehicleListView
        vehicles={currentVehicles}
        isLoading={isLoading}
        selectedVehicles={selectedVehicles}
        onSelectionChange={setSelectedVehicles}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isMobile={isMobile}
      />
    </div>
  );
};

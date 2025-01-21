import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleTableContent } from "./table/VehicleTableContent";
import { VehicleTablePagination } from "./table/VehicleTablePagination";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateVehicleDialog } from "./CreateVehicleDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";
import type { Vehicle } from "@/types/vehicle";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  sold: "bg-red-100 text-red-800",
};

export const VehicleList = () => {
  const [filters, setFilters] = useState({ status: "all", searchQuery: "" });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      let query = supabase.from("vehicles").select();

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.searchQuery) {
        query = query.or(
          `make.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%,license_plate.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return (data || []) as Vehicle[];
    },
  });

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="pt-32 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <AdvancedVehicleFilters onFilterChange={setFilters} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportToExcel()}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <CreateVehicleDialog>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </CreateVehicleDialog>
        </div>
      </div>

      <VehicleTableContent vehicles={vehicles} isLoading={isLoading} onDeleteClick={handleDeleteClick} />
      <VehicleTablePagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      <DeleteVehicleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        vehicle={selectedVehicle}
      />
      <VehicleDetailsDialog vehicle={selectedVehicle} />
    </div>
  );
};

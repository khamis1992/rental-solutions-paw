import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateVehicleDialog } from "./CreateVehicleDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { VehicleStats } from "./VehicleStats";
import { VehicleListView } from "./table/VehicleListView";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";
import { BulkActionsMenu } from "./components/BulkActionsMenu";
import { Vehicle } from "@/types/vehicle";

export const VehicleList = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `license_plate.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`
        );
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const handleDeleteComplete = () => {
    setSelectedVehicles([]);
    setShowDeleteDialog(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <VehicleStats />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <AdvancedVehicleFilters 
            onSearch={setSearchQuery}
            onStatusChange={setStatusFilter}
          />
          {selectedVehicles.length > 0 && (
            <BulkActionsMenu
              selectedCount={selectedVehicles.length}
              onDelete={() => setShowDeleteDialog(true)}
            />
          )}
        </div>

        <VehicleListView
          vehicles={vehicles || []}
          isLoading={isLoading}
          selectedVehicles={selectedVehicles}
          onSelectionChange={setSelectedVehicles}
        />
      </div>

      <CreateVehicleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <DeleteVehicleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        vehicleIds={selectedVehicles}
        onDeleteComplete={handleDeleteComplete}
      />
    </div>
  );
};
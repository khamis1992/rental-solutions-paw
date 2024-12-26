import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleTableContent } from "./table/VehicleTableContent";
import { VehicleTablePagination } from "./table/VehicleTablePagination";

type VehicleStatus = "maintenance" | "available" | "rented" | "retired" | "police_station" | "accident" | "reserve" | "stolen";

const STATUS_COLORS = {
  accident: "#F97316",
  available: "#0EA5E9",
  maintenance: "#800000",
  police_station: "#D946EF",
  retired: "#CA8A04",
  stolen: "#EF4444",
  reserve: "#8B5CF6",
  rented: "#22C55E"
} as const;

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  vin: string;
  mileage: number;
  license_plate: string;
  location: string | null;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const VehicleList = ({ vehicles, isLoading, onVehicleClick }: VehicleListProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVehicles = vehicles.slice(startIndex, endIndex);

  const updateVehicleStatus = useMutation({
    mutationFn: async ({ vehicleId, newStatus }: { vehicleId: string; newStatus: VehicleStatus }) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus })
        .eq('id', vehicleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Status updated",
        description: "Vehicle status has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    },
  });

  const handleLicensePlateClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVehicleId(vehicleId);
    setShowVehicleDetails(true);
  };

  const handleDeleteClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVehicleId(vehicleId);
    setShowDeleteDialog(true);
  };

  const handleStatusChange = (vehicleId: string, newStatus: VehicleStatus) => {
    updateVehicleStatus.mutate({ vehicleId, newStatus });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    // Subscribe to real-time location updates
    const channel = supabase
      .channel('vehicle-locations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'location=neq.null'
        },
        (payload: any) => {
          const updatedVehicle = payload.new;
          if (updatedVehicle.location) {
            toast({
              title: "Location Updated",
              description: `${updatedVehicle.make} ${updatedVehicle.model} location updated to ${updatedVehicle.location}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <VehicleTableContent
          vehicles={currentVehicles}
          onVehicleClick={onVehicleClick}
          onStatusChange={handleStatusChange}
          onDeleteClick={handleDeleteClick}
          onLicensePlateClick={handleLicensePlateClick}
          STATUS_COLORS={STATUS_COLORS}
        />
      </div>

      <div className="flex justify-center mt-4">
        <VehicleTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {selectedVehicleId && showVehicleDetails && (
        <VehicleDetailsDialog
          vehicleId={selectedVehicleId}
          open={showVehicleDetails}
          onOpenChange={setShowVehicleDetails}
        />
      )}

      {selectedVehicleId && selectedVehicle && showDeleteDialog && (
        <DeleteVehicleDialog
          vehicleId={selectedVehicleId}
          vehicleName={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </div>
  );
};

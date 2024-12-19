import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteVehicleDialogProps {
  vehicleId: string;
  vehicleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteVehicleDialog = ({
  vehicleId,
  vehicleName,
  open,
  onOpenChange,
}: DeleteVehicleDialogProps) => {
  const queryClient = useQueryClient();

  const deleteVehicle = useMutation({
    mutationFn: async () => {
      console.log("Starting deletion process for vehicle:", vehicleId);
      
      // First, check if there are any related maintenance records
      const { data: maintenanceRecords, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('id, status')
        .eq('vehicle_id', vehicleId);
        
      if (maintenanceError) {
        console.error("Error checking maintenance records:", maintenanceError);
        throw maintenanceError;
      }

      // If there are maintenance records, delete them first
      if (maintenanceRecords && maintenanceRecords.length > 0) {
        console.log("Found maintenance records:", maintenanceRecords);
        const { error: deleteMaintenanceError } = await supabase
          .from('maintenance')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (deleteMaintenanceError) {
          console.error("Error deleting maintenance records:", deleteMaintenanceError);
          throw deleteMaintenanceError;
        }
      }

      // Check for any vehicle inspections
      const { data: inspections, error: inspectionError } = await supabase
        .from('vehicle_inspections')
        .select('id')
        .eq('vehicle_id', vehicleId);

      if (inspectionError) {
        console.error("Error checking inspections:", inspectionError);
        throw inspectionError;
      }

      // Delete any vehicle inspections
      if (inspections && inspections.length > 0) {
        console.log("Found inspections:", inspections);
        const { error: deleteInspectionError } = await supabase
          .from('vehicle_inspections')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (deleteInspectionError) {
          console.error("Error deleting inspections:", deleteInspectionError);
          throw deleteInspectionError;
        }
      }

      // Finally, delete the vehicle
      console.log("Attempting to delete vehicle:", vehicleId);
      const { error: deleteVehicleError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (deleteVehicleError) {
        console.error("Error deleting vehicle:", deleteVehicleError);
        throw deleteVehicleError;
      }

      console.log("Vehicle deletion completed successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success("Vehicle deleted successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error in delete mutation:', error);
      toast.error("Failed to delete vehicle. Please try again or contact support.");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {vehicleName}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteVehicle.mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
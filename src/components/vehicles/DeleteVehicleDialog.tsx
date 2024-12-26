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
      console.log("Starting force deletion process for vehicle:", vehicleId);
      
      try {
        // 1. First get all leases associated with this vehicle
        const { data: leases, error: leaseError } = await supabase
          .from('leases')
          .select('id')
          .eq('vehicle_id', vehicleId);

        if (leaseError) throw leaseError;

        const leaseIds = leases?.map(lease => lease.id) || [];

        // 2. Delete damages
        const { error: damagesError } = await supabase
          .from('damages')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (damagesError) throw damagesError;

        if (leaseIds.length > 0) {
          const { error: leaseDamagesError } = await supabase
            .from('damages')
            .delete()
            .in('lease_id', leaseIds);

          if (leaseDamagesError) throw leaseDamagesError;
        }

        // 3. Delete traffic fines
        const { error: trafficFinesError } = await supabase
          .from('traffic_fines')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (trafficFinesError) throw trafficFinesError;

        if (leaseIds.length > 0) {
          const { error: leaseTrafficFinesError } = await supabase
            .from('traffic_fines')
            .delete()
            .in('lease_id', leaseIds);

          if (leaseTrafficFinesError) throw leaseTrafficFinesError;
        }

        // 4. Delete vehicle inspections and related maintenance documents
        const { error: inspectionsError } = await supabase
          .from('vehicle_inspections')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (inspectionsError) throw inspectionsError;

        // 5. Delete maintenance documents and maintenance records
        const { error: maintenanceDocsError } = await supabase
          .from('maintenance_documents')
          .delete()
          .eq('maintenance_id', vehicleId);

        if (maintenanceDocsError) throw maintenanceDocsError;

        const { error: maintenanceError } = await supabase
          .from('maintenance')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (maintenanceError) throw maintenanceError;

        // 6. Delete agreement documents
        if (leaseIds.length > 0) {
          const { error: leaseDocsError } = await supabase
            .from('agreement_documents')
            .delete()
            .in('lease_id', leaseIds);

          if (leaseDocsError) throw leaseDocsError;
        }

        const { error: vehicleDocsError } = await supabase
          .from('agreement_documents')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (vehicleDocsError) throw vehicleDocsError;

        // 7. Delete vehicle documents
        const { error: vehicleDocumentsError } = await supabase
          .from('vehicle_documents')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (vehicleDocumentsError) throw vehicleDocumentsError;

        // 8. Delete vehicle parts
        const { error: vehiclePartsError } = await supabase
          .from('vehicle_parts')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (vehiclePartsError) throw vehiclePartsError;

        // 9. Delete vehicle insurance
        const { error: insuranceError } = await supabase
          .from('vehicle_insurance')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (insuranceError) throw insuranceError;

        // 10. Delete leases
        const { error: leasesError } = await supabase
          .from('leases')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (leasesError) throw leasesError;

        // 11. Finally delete the vehicle
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);

        if (vehicleError) throw vehicleError;

        console.log("Vehicle deletion completed successfully");
      } catch (error: any) {
        console.error("Error in delete mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success("Vehicle deleted successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
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
            This will permanently delete {vehicleName} and all related records. This action cannot be undone.
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
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
        // 1. First delete agreement documents
        const { error: docsError } = await supabase
          .from('agreement_documents')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (docsError) {
          console.error("Error deleting agreement documents:", docsError);
          throw docsError;
        }

        // 2. Then delete any documents that reference leases associated with this vehicle
        const { data: leases } = await supabase
          .from('leases')
          .select('id')
          .eq('vehicle_id', vehicleId);

        if (leases && leases.length > 0) {
          const leaseIds = leases.map(lease => lease.id);
          const { error: leaseDocsError } = await supabase
            .from('agreement_documents')
            .delete()
            .in('lease_id', leaseIds);

          if (leaseDocsError) {
            console.error("Error deleting lease documents:", leaseDocsError);
            throw leaseDocsError;
          }
        }

        // 3. Delete associated leases
        const { error: leasesError } = await supabase
          .from('leases')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (leasesError) {
          console.error("Error deleting leases:", leasesError);
          throw leasesError;
        }

        // 4. Finally delete the vehicle
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);

        if (vehicleError) {
          console.error("Error deleting vehicle:", vehicleError);
          throw vehicleError;
        }

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
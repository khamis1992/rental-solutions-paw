import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteMaintenanceDialogProps {
  id: string;
  vehicleId: string;
  status: string;
}

export const DeleteMaintenanceDialog = ({ id, vehicleId, status }: DeleteMaintenanceDialogProps) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      console.log("Starting deletion process for maintenance record:", id);
      
      // First, delete any related vehicle inspections
      const { error: inspectionError } = await supabase
        .from('vehicle_inspections')
        .delete()
        .eq('maintenance_id', id);

      if (inspectionError) {
        console.error("Error deleting related inspections:", inspectionError);
        throw inspectionError;
      }

      // Then delete the maintenance record
      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', id);

      if (maintenanceError) {
        console.error("Error deleting maintenance record:", maintenanceError);
        throw maintenanceError;
      }

      // If status was scheduled or in_progress, update vehicle status
      if (status === 'scheduled' || status === 'in_progress') {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', vehicleId);

        if (vehicleError) {
          console.error("Error updating vehicle status:", vehicleError);
          throw vehicleError;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] })
      ]);

      toast.success('Maintenance record deleted successfully');
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast.error(error.message || 'Failed to delete maintenance record');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Maintenance Record</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this maintenance record? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
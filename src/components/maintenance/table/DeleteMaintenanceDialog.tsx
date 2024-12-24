import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface DeleteMaintenanceDialogProps {
  recordId: string;
  vehicleId: string;
  status: string;
}

export const DeleteMaintenanceDialog = ({ recordId, vehicleId, status }: DeleteMaintenanceDialogProps) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting maintenance record:", recordId);

      // First delete related maintenance documents
      const { error: docsError } = await supabase
        .from('maintenance_documents')
        .delete()
        .eq('maintenance_id', recordId);

      if (docsError) {
        console.error("Error deleting maintenance documents:", docsError);
        throw docsError;
      }

      // Then delete the maintenance record
      const { error } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      // If the vehicle is in maintenance status and this was the only maintenance record,
      // update vehicle status back to available
      if (status === 'scheduled' || status === 'in_progress') {
        const { data: otherMaintenanceRecords } = await supabase
          .from('maintenance')
          .select('id')
          .eq('vehicle_id', vehicleId)
          .neq('id', recordId);

        if (!otherMaintenanceRecords?.length) {
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update({ status: 'available' })
            .eq('id', vehicleId);

          if (vehicleError) throw vehicleError;
        }
      }

      // Force refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] })
      ]);

      setIsOpen(false);
      toast.success('Maintenance record deleted successfully');
    } catch (error: any) {
      console.error("Error deleting maintenance record:", error);
      toast.error(error.message || 'Failed to delete maintenance record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={isDeleting}
        >
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
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
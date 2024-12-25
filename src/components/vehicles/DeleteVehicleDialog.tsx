import { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteVehicleDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleDialog({
  vehicleId,
  open,
  onOpenChange,
}: DeleteVehicleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Check for active leases
      const { data: activeLeases } = await supabase
        .from("leases")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .eq("status", "active");

      if (activeLeases && activeLeases.length > 0) {
        toast.error("Cannot delete vehicle with active leases");
        return;
      }

      // Delete related records first
      await Promise.all([
        supabase.from("vehicle_documents").delete().eq("vehicle_id", vehicleId),
        supabase.from("vehicle_inspections").delete().eq("vehicle_id", vehicleId),
        supabase.from("vehicle_insurance").delete().eq("vehicle_id", vehicleId),
        supabase.from("vehicle_parts").delete().eq("vehicle_id", vehicleId),
        supabase.from("maintenance").delete().eq("vehicle_id", vehicleId),
        supabase.from("damages").delete().eq("vehicle_id", vehicleId),
      ]);

      // Finally delete the vehicle
      const { error: deleteError } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (deleteError) throw deleteError;

      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the vehicle
            and all associated records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteVehicleDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleDialog({ vehicleId, open, onOpenChange }: DeleteVehicleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Check for active leases
      const { data: leases } = await supabase
        .from("leases")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .eq("status", "active");

      if (leases && leases.length > 0) {
        toast.error("Cannot delete vehicle with active leases");
        return;
      }

      // Check for payment history
      const { data: payments } = await supabase
        .from("payment_history_view")
        .select("id")
        .eq("vehicle_id", vehicleId);

      if (payments && payments.length > 0) {
        toast.error("Cannot delete vehicle with payment history");
        return;
      }

      // Delete the vehicle
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (error) throw error;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

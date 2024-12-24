import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface StatusSelectProps {
  recordId: string;
  vehicleId: string;
  currentStatus: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
}

export const StatusSelect = ({ recordId, vehicleId, currentStatus }: StatusSelectProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      setIsUpdating(true);
      console.log("Updating maintenance status:", { recordId, newStatus });

      const updateData = {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : null
      };

      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update(updateData)
        .eq('id', recordId);

      if (maintenanceError) throw maintenanceError;

      const newVehicleStatus = (newStatus === 'completed' || newStatus === 'cancelled') 
        ? 'available' 
        : 'maintenance';

      console.log("Updating vehicle status:", { vehicleId, newStatus: newVehicleStatus });
      
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: newVehicleStatus })
        .eq('id', vehicleId);

      if (vehicleError) throw vehicleError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] })
      ]);

      toast.success('Status updated successfully');
    } catch (error: any) {
      console.error("Error updating maintenance status:", error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'urgent') {
    return <Badge variant="destructive">Urgent</Badge>;
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
};
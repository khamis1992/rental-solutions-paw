import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface MaintenanceStatusSelectProps {
  id: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  vehicleId: string;
}

export const MaintenanceStatusSelect = ({ id, status, vehicleId }: MaintenanceStatusSelectProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      console.log("Current record:", { id, status, vehicleId });
      console.log("Updating maintenance status to:", newStatus);

      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (maintenanceError) throw maintenanceError;

      const newVehicleStatus = (newStatus === 'completed' || newStatus === 'cancelled') 
        ? 'available' 
        : 'maintenance';

      console.log("Updating vehicle status to:", newVehicleStatus);
      
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
      console.error("Error in handleStatusChange:", error);
      toast.error('Failed to update status');
    }
  };

  if (status === 'urgent') {
    return <Badge variant="destructive">Urgent</Badge>;
  }

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
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
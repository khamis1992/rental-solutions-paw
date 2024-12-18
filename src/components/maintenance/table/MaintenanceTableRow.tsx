import { TableCell, TableRow } from "@/components/ui/table";
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

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  cost: number | null;
  scheduled_date: string;
}

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      console.log('Updating maintenance status to:', newStatus);
      console.log('Current record:', record);

      // Start a transaction by using multiple operations
      // 1. Update maintenance record
      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', record.id);

      if (maintenanceError) {
        console.error('Error updating maintenance:', maintenanceError);
        throw maintenanceError;
      }

      // 2. Update vehicle status based on maintenance status
      let newVehicleStatus = 'maintenance';
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        newVehicleStatus = 'available';
      }

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: newVehicleStatus })
        .eq('id', record.vehicle_id);

      if (vehicleError) {
        console.error('Error updating vehicle:', vehicleError);
        throw vehicleError;
      }

      console.log('Vehicle status updated to:', newVehicleStatus);

      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] }),
        // Add any other relevant queries that need to be invalidated
      ]);
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error in handleStatusChange:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <TableRow key={record.id}>
      <TableCell>{record.service_type}</TableCell>
      <TableCell>
        {new Date(record.scheduled_date).toLocaleDateString()}
      </TableCell>
      <TableCell>{record.cost ? `${record.cost} QAR` : '-'}</TableCell>
      <TableCell>
        <Select
          value={record.status}
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
      </TableCell>
    </TableRow>
  );
};
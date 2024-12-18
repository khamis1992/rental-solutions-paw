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
import { MaintenanceStatus, VehicleStatus } from "../MaintenanceList";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  status: MaintenanceStatus;
  cost: number | null;
  scheduled_date: string;
}

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    try {
      console.log('Updating maintenance status to:', newStatus);
      console.log('Current record:', record);

      if (record.status === "urgent") {
        // For urgent (accident) records, only update the vehicle status
        const newVehicleStatus: VehicleStatus = newStatus === "completed" || newStatus === "cancelled" 
          ? "available" 
          : "maintenance";

        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: newVehicleStatus })
          .eq('id', record.vehicle_id);

        if (vehicleError) {
          console.error('Error updating vehicle:', vehicleError);
          throw vehicleError;
        }
      } else {
        // For regular maintenance records, update both maintenance and vehicle status
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

        const newVehicleStatus: VehicleStatus = newStatus === "completed" || newStatus === "cancelled" 
          ? "available" 
          : "maintenance";

        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: newVehicleStatus })
          .eq('id', record.vehicle_id);

        if (vehicleError) {
          console.error('Error updating vehicle:', vehicleError);
          throw vehicleError;
        }
      }

      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] }),
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
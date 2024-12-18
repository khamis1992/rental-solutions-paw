import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  cost: number | null;
  scheduled_date: string;
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      console.log("Current record:", record);
      console.log("Updating maintenance status to:", newStatus);

      // Update maintenance record
      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', record.id);

      if (maintenanceError) throw maintenanceError;

      // Update vehicle status based on maintenance status
      const newVehicleStatus = (newStatus === 'completed' || newStatus === 'cancelled') 
        ? 'available' 
        : 'maintenance';

      console.log("Updating vehicle status to:", newVehicleStatus);
      
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: newVehicleStatus })
        .eq('id', record.vehicle_id);

      if (vehicleError) throw vehicleError;

      // Invalidate and refetch queries
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

  return (
    <TableRow>
      <TableCell>{record.vehicles?.license_plate || 'N/A'}</TableCell>
      <TableCell>
        {record.vehicles 
          ? `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}`
          : 'Vehicle details unavailable'}
      </TableCell>
      <TableCell>{record.service_type}</TableCell>
      <TableCell>
        {record.status === 'urgent' ? (
          <Badge variant="destructive">Urgent</Badge>
        ) : (
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
        )}
      </TableCell>
      <TableCell>
        {new Date(record.scheduled_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {record.cost ? `${record.cost} QAR` : '-'}
      </TableCell>
    </TableRow>
  );
};
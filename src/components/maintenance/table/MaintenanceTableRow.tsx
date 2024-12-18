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
      const { error } = await supabase
        .from('maintenance')
        .update({ status: newStatus })
        .eq('id', record.id);

      if (error) throw error;

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
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
            defaultValue={record.status}
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
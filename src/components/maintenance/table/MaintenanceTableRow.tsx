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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  cost?: number | null;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  vehicles?: Vehicle;
}

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  const queryClient = useQueryClient();
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      console.log("Current record:", record);
      console.log("Updating maintenance status to:", newStatus);

      const { error: maintenanceError } = await supabase
        .from('maintenance')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', record.id);

      if (maintenanceError) throw maintenanceError;

      const newVehicleStatus = (newStatus === 'completed' || newStatus === 'cancelled') 
        ? 'available' 
        : 'maintenance';

      console.log("Updating vehicle status to:", newVehicleStatus);
      
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: newVehicleStatus })
        .eq('id', record.vehicle_id);

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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting maintenance record:", record.id);

      // First, delete any associated maintenance documents
      const { error: docsError } = await supabase
        .from('maintenance_documents')
        .delete()
        .eq('maintenance_id', record.id);

      if (docsError) {
        console.error("Error deleting maintenance documents:", docsError);
        throw docsError;
      }

      // Then delete the maintenance record
      const { error } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      // If the vehicle is in maintenance status and this was its only maintenance record,
      // update its status to available
      if (record.status === 'scheduled' || record.status === 'in_progress') {
        const { data: otherMaintenanceRecords } = await supabase
          .from('maintenance')
          .select('id')
          .eq('vehicle_id', record.vehicle_id)
          .neq('id', record.id);

        if (!otherMaintenanceRecords?.length) {
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update({ status: 'available' })
            .eq('id', record.vehicle_id);

          if (vehicleError) throw vehicleError;
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['maintenance'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] })
      ]);

      toast.success('Maintenance record deleted successfully');
    } catch (error: any) {
      console.error("Error deleting maintenance record:", error);
      toast.error('Failed to delete maintenance record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <button
            onClick={() => setShowVehicleDetails(true)}
            className="text-primary hover:underline focus:outline-none"
          >
            {record.vehicles?.license_plate || 'N/A'}
          </button>
        </TableCell>
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
        <TableCell>
          <AlertDialog>
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
        </TableCell>
      </TableRow>

      {showVehicleDetails && record.vehicle_id && (
        <VehicleDetailsDialog
          vehicleId={record.vehicle_id}
          open={showVehicleDetails}
          onOpenChange={setShowVehicleDetails}
        />
      )}
    </>
  );
};
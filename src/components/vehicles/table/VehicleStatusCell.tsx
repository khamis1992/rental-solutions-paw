import { Badge } from "@/components/ui/badge";
import { VehicleStatus } from "@/types/vehicle";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface VehicleStatusCellProps {
  status: VehicleStatus;
  vehicleId: string;
  onStatusChange?: (newStatus: VehicleStatus) => void;
}

export const VehicleStatusCell = ({ status, vehicleId, onStatusChange }: VehicleStatusCellProps) => {
  const queryClient = useQueryClient();

  const STATUS_COLORS = {
    available: "#22c55e",    // green
    rented: "#3b82f6",      // blue
    maintenance: "#f59e0b",  // amber
    retired: "#6b7280",     // gray
    police_station: "#dc2626", // red
    accident: "#ef4444",    // red
    reserve: "#8b5cf6",     // violet
    stolen: "#dc2626"       // red
  };

  useEffect(() => {
    // Create maintenance record when status changes to maintenance
    const handleMaintenanceStatus = async () => {
      if (status === 'maintenance') {
        try {
          // Create new maintenance record
          const { error: maintenanceError } = await supabase
            .from('maintenance')
            .insert({
              vehicle_id: vehicleId,
              service_type: 'General Maintenance',
              status: 'scheduled',
              description: 'Vehicle status changed to maintenance',
              scheduled_date: new Date().toISOString()
            });

          if (maintenanceError) throw maintenanceError;

          // Invalidate maintenance queries to trigger refresh
          await queryClient.invalidateQueries({ queryKey: ['maintenance'] });
          await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
          
          toast.success('Maintenance record created successfully');
        } catch (error) {
          console.error('Error creating maintenance record:', error);
          toast.error('Failed to create maintenance record');
        }
      }
    };

    handleMaintenanceStatus();
  }, [status, vehicleId, queryClient]);

  return (
    <Badge
      className="text-white"
      style={{
        backgroundColor: STATUS_COLORS[status] || "#CBD5E1" // fallback color
      }}
    >
      {status}
    </Badge>
  );
};
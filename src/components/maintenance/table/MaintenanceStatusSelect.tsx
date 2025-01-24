import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MaintenanceStatus } from "@/types/maintenance";

interface MaintenanceStatusSelectProps {
  id: string;
  currentStatus: MaintenanceStatus;
  onStatusChange?: (newStatus: MaintenanceStatus) => void;
}

export const MaintenanceStatusSelect = ({ 
  id, 
  currentStatus,
  onStatusChange 
}: MaintenanceStatusSelectProps) => {
  const [statuses, setStatuses] = useState<MaintenanceStatus[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('status');

      if (error) {
        console.error('Error fetching statuses:', error);
        return;
      }

      const uniqueStatuses = Array.from(new Set(data.map(item => item.status).filter(Boolean))) as MaintenanceStatus[];
      setStatuses(uniqueStatuses);
    };

    fetchStatuses();
  }, []);

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    try {
      setIsUpdating(true);
      
      // Check if this is an accident record (prefixed ID)
      if (id.startsWith('accident-')) {
        // For accident records, we update the vehicle status instead
        const vehicleId = id.replace('accident-', '');
        const { error } = await supabase
          .from('vehicles')
          .update({ status: newStatus === 'completed' ? 'available' : 'maintenance' })
          .eq('id', vehicleId);

        if (error) throw error;
      } else {
        // Regular maintenance record update
        const { error } = await supabase
          .from('maintenance')
          .update({ status: newStatus })
          .eq('id', id);

        if (error) throw error;
      }

      onStatusChange?.(newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'accident':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Map 'urgent' to 'accident' for display
  const displayStatus = currentStatus === 'urgent' ? 'accident' : currentStatus;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={displayStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <Badge variant="outline" className={`${getStatusColor(displayStatus)} capitalize`}>
              {displayStatus.replace('_', ' ')}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              <Badge variant="outline" className={`${getStatusColor(status)} capitalize`}>
                {status.replace('_', ' ')}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
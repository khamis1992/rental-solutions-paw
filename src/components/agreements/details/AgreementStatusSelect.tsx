import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaseStatus } from "@/types/agreement.types";

interface AgreementStatusSelectProps {
  agreementId: string;
  currentStatus: LeaseStatus;
  onStatusChange?: (newStatus: LeaseStatus) => void;
}

export const AgreementStatusSelect = ({ 
  agreementId, 
  currentStatus,
  onStatusChange 
}: AgreementStatusSelectProps) => {
  const [statuses, setStatuses] = useState<LeaseStatus[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      // Get all statuses from the leases table
      const { data, error } = await supabase
        .from('leases')
        .select('status');

      if (error) {
        console.error('Error fetching statuses:', error);
        return;
      }

      // Filter out null values and create a unique array of statuses
      const uniqueStatuses = Array.from(new Set(data.map(item => item.status).filter(Boolean))) as LeaseStatus[];
      setStatuses(uniqueStatuses);
    };

    fetchStatuses();
  }, []);

  const handleStatusChange = async (newStatus: LeaseStatus) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('leases')
        .update({ status: newStatus })
        .eq('id', agreementId);

      if (error) throw error;

      onStatusChange?.(newStatus);
      toast.success('Agreement status updated successfully');
    } catch (error) {
      console.error('Error updating agreement status:', error);
      toast.error('Failed to update agreement status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: LeaseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_deposit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <Badge variant="outline" className={`${getStatusColor(currentStatus)} capitalize`}>
              {currentStatus.replace('_', ' ')}
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
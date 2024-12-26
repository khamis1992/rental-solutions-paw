import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgreementStatusProps {
  agreementId: string;
  currentStatus: string;
}

export const AgreementStatus = ({ agreementId, currentStatus }: AgreementStatusProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('leases')
        .update({ status: newStatus })
        .eq('id', agreementId);

      if (error) throw error;

      setStatus(newStatus);
      toast.success('Agreement status updated successfully');
    } catch (error) {
      console.error('Error updating agreement status:', error);
      toast.error('Failed to update agreement status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending_payment">Pending Payment</SelectItem>
        <SelectItem value="pending_deposit">Pending Deposit</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
  );
};
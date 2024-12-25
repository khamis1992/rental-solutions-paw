import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTrafficFineAssignment = () => {
  const assignFine = async (fineId: string) => {
    try {
      // Get the fine details first
      const { data: fine, error: fineError } = await supabase
        .from('traffic_fines')
        .select('*')
        .eq('id', fineId)
        .single();

      if (fineError) throw fineError;
      if (!fine.violation_date || !fine.vehicle_id) {
        throw new Error("Fine missing required data");
      }

      // Find matching lease
      const { data: leases, error: leaseError } = await supabase
        .from('leases')
        .select('id, customer_id')
        .lte('start_date', fine.violation_date)
        .gte('end_date', fine.violation_date)
        .eq('vehicle_id', fine.vehicle_id)
        .limit(1);

      if (leaseError) throw leaseError;

      if (!leases?.length) {
        toast({
          title: "No Matching Lease",
          description: "No lease found covering the violation date",
          variant: "destructive",
        });
        return;
      }

      // Update the fine with the matching lease
      const { error: updateError } = await supabase
        .from('traffic_fines')
        .update({ 
          lease_id: leases[0].id,
          assignment_status: 'assigned'
        })
        .eq('id', fineId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Fine assigned successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning fine:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign fine",
        variant: "destructive",
      });
      return false;
    }
  };

  return { assignFine };
};
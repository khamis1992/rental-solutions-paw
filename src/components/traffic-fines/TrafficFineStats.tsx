import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatsDisplay } from "./components/StatsDisplay";
import { ReconcileButton } from "./components/ReconcileButton";

interface TrafficFineStatsProps {
  agreementId?: string;
  paymentCount: number;
}

export function TrafficFineStats({ agreementId, paymentCount }: TrafficFineStatsProps) {
  const queryClient = useQueryClient();
  const [isReconciling, setIsReconciling] = useState(false);

  // Query to get unassigned fines count
  const { data: unassignedCount = 0 } = useQuery({
    queryKey: ["unassigned-fines-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('traffic_fines')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_status', 'pending');
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query to get total amount of all fines
  const { data: totalAmount = 0 } = useQuery({
    queryKey: ["traffic-fines-total-amount"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('fine_amount');
      
      if (error) throw error;
      
      return data.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    }
  });

  // Query to get total amount of unassigned fines
  const { data: unassignedAmount = 0 } = useQuery({
    queryKey: ["unassigned-fines-amount"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('fine_amount')
        .eq('assignment_status', 'pending');
      
      if (error) throw error;
      
      return data.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
    }
  });

  const handleBulkAssignment = async () => {
    setIsReconciling(true);
    try {
      const { data: unassignedFines, error: finesError } = await supabase
        .from('traffic_fines')
        .select('id, violation_date, vehicle_id, license_plate')
        .eq('assignment_status', 'pending');

      if (finesError) throw finesError;

      let assignedCount = 0;
      let errorCount = 0;

      for (const fine of unassignedFines || []) {
        try {
          let query = supabase
            .from('leases')
            .select('id');

          if (fine.vehicle_id) {
            query = query.eq('vehicle_id', fine.vehicle_id);
          } else if (fine.license_plate) {
            const { data: vehicles } = await supabase
              .from('vehicles')
              .select('id')
              .eq('license_plate', fine.license_plate)
              .limit(1);

            if (vehicles && vehicles.length > 0) {
              query = query.eq('vehicle_id', vehicles[0].id);
            } else {
              console.log(`No vehicle found for license plate ${fine.license_plate}`);
              errorCount++;
              continue;
            }
          } else {
            console.log('No vehicle_id or license_plate available for fine');
            errorCount++;
            continue;
          }

          if (fine.violation_date) {
            query = query
              .lte('start_date', fine.violation_date)
              .gte('end_date', fine.violation_date);
          }

          const { data: leases, error: leaseError } = await query.limit(1);

          if (leaseError) {
            console.error('Lease query error:', leaseError);
            errorCount++;
            continue;
          }

          if (leases && leases.length > 0) {
            const { error: updateError } = await supabase
              .from('traffic_fines')
              .update({ 
                lease_id: leases[0].id,
                assignment_status: 'assigned'
              })
              .eq('id', fine.id);

            if (updateError) {
              console.error('Update error:', updateError);
              errorCount++;
              continue;
            }
            assignedCount++;
          } else {
            console.log(`No matching lease found for fine ${fine.id}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing fine ${fine.id}:`, error);
          errorCount++;
        }
      }

      toast.success(
        `Successfully assigned ${assignedCount} fines. ${errorCount} fines could not be assigned.`
      );

      // Refresh the stats after assignment
      queryClient.invalidateQueries({ queryKey: ["traffic-fines"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-fines-count"] });
      queryClient.invalidateQueries({ queryKey: ["traffic-fines-total-amount"] });

    } catch (error: any) {
      console.error('Bulk assignment failed:', error);
      toast.error('Failed to assign fines');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <StatsDisplay 
        paymentCount={paymentCount}
        unassignedCount={unassignedCount}
        totalAmount={totalAmount}
        unassignedAmount={unassignedAmount}
      />
      <ReconcileButton 
        isReconciling={isReconciling}
        unassignedCount={unassignedCount}
        onReconcile={handleBulkAssignment}
      />
    </div>
  );
}
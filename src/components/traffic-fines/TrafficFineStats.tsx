import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TrafficFineStatsProps {
  agreementId?: string;
  paymentCount: number;
}

export function TrafficFineStats({ agreementId, paymentCount }: TrafficFineStatsProps) {
  const queryClient = useQueryClient();
  const [isReconciling, setIsReconciling] = useState(false);

  const handleBulkAssignment = async () => {
    setIsReconciling(true);
    try {
      // Get all unassigned fines
      const { data: unassignedFines, error: finesError } = await supabase
        .from('traffic_fines')
        .select('id, violation_date, vehicle_id')
        .eq('assignment_status', 'pending');

      if (finesError) throw finesError;

      let assignedCount = 0;
      let errorCount = 0;

      // Process each fine
      for (const fine of unassignedFines || []) {
        try {
          // Skip fines without a vehicle_id
          if (!fine.vehicle_id) {
            console.warn(`Skipping fine ${fine.id} - no vehicle_id`);
            errorCount++;
            continue;
          }

          // Find any lease that covers the violation date for the vehicle
          let query = supabase
            .from('leases')
            .select('id');

          // Only add vehicle_id condition if it exists
          if (fine.vehicle_id) {
            query = query.eq('vehicle_id', fine.vehicle_id);
          }

          // Add date conditions only if violation_date exists
          if (fine.violation_date) {
            query = query
              .lte('start_date', fine.violation_date)
              .gte('end_date', fine.violation_date);
          }

          const { data: leases, error: leaseError } = await query.limit(1);

          if (leaseError) throw leaseError;

          if (leases && leases.length > 0) {
            // Assign the fine to the lease
            const { error: updateError } = await supabase
              .from('traffic_fines')
              .update({ 
                lease_id: leases[0].id,
                assignment_status: 'assigned'
              })
              .eq('id', fine.id);

            if (updateError) throw updateError;
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

    } catch (error: any) {
      console.error('Bulk assignment failed:', error);
      toast.error(error.message || "Failed to process traffic fines");
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 flex-1">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
            <p className="text-2xl font-bold">{paymentCount}</p>
          </div>
        </Card>
      </div>
      <div className="ml-4">
        <Button
          onClick={handleBulkAssignment}
          disabled={isReconciling || !paymentCount}
          className="whitespace-nowrap"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
          {isReconciling ? "Assigning..." : "Auto-Assign All"}
        </Button>
      </div>
    </div>
  );
}
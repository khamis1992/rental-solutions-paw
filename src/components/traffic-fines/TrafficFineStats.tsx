import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";

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

  const handleBulkAssignment = async () => {
    setIsReconciling(true);
    try {
      // Get all unassigned fines
      const { data: unassignedFines, error: finesError } = await supabase
        .from('traffic_fines')
        .select('id, violation_date, vehicle_id, license_plate')
        .eq('assignment_status', 'pending');

      if (finesError) throw finesError;

      let assignedCount = 0;
      let errorCount = 0;

      // Process each fine
      for (const fine of unassignedFines || []) {
        try {
          let query = supabase
            .from('leases')
            .select('id');

          // Try to match by vehicle_id if available
          if (fine.vehicle_id) {
            query = query.eq('vehicle_id', fine.vehicle_id);
          } else if (fine.license_plate) {
            // If no vehicle_id, try to find vehicle by license plate first
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

          // Add date conditions
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
            // Assign the fine to the lease
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

    } catch (error: any) {
      console.error('Bulk assignment failed:', error);
      toast.error(error.message || "Failed to process traffic fines");
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 flex-1">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
            <p className="text-2xl font-bold">{paymentCount}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
            <p className="text-2xl font-bold">{unassignedCount}</p>
          </div>
        </Card>
      </div>
      <div className="ml-4">
        <Button
          onClick={handleBulkAssignment}
          disabled={isReconciling || !unassignedCount}
          className="whitespace-nowrap"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
          {isReconciling ? "Assigning..." : "Auto-Assign All"}
        </Button>
      </div>
    </div>
  );
}
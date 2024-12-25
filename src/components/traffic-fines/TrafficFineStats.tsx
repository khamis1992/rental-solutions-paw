import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const TrafficFineStats = () => {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["traffic-fines-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('fine_amount, assignment_status');

      if (error) throw error;

      const totalAmount = data.reduce((sum, fine) => sum + (fine.fine_amount || 0), 0);
      const totalFines = data.length;
      const unassignedFines = data.filter(fine => fine.assignment_status === 'pending').length;

      return {
        totalAmount,
        totalFines,
        unassignedFines
      };
    },
  });

  const handleBulkAssignment = async () => {
    setIsAssigning(true);
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
          // Find any lease that covers the violation date for the vehicle, regardless of status
          const { data: leases, error: leaseError } = await supabase
            .from('leases')
            .select('id')
            .eq('vehicle_id', fine.vehicle_id)
            .lte('start_date', fine.violation_date)
            .gte('end_date', fine.violation_date)
            .limit(1);

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

      // Show success message with details
      toast({
        description: `Successfully assigned ${assignedCount} fines. ${errorCount} fines could not be assigned.`,
      });

      // Refresh the stats after assignment
      refetch();

    } catch (error: any) {
      console.error('Bulk assignment failed:', error);
      toast({
        variant: "destructive",
        description: error.message || "Failed to process traffic fines",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 flex-1">
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
              <p className="text-2xl font-bold">{stats?.totalFines || 0}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Unassigned Fines</p>
              <p className="text-2xl font-bold">{stats?.unassignedFines || 0}</p>
            </div>
          </Card>
        </div>
        <div className="ml-4">
          <Button
            onClick={handleBulkAssignment}
            disabled={isAssigning || (stats?.unassignedFines || 0) === 0}
            className="whitespace-nowrap"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isAssigning ? "Assigning..." : "Auto-Assign All"}
          </Button>
        </div>
      </div>
    </div>
  );
};
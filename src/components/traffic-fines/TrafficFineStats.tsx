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

  const { data: stats, isLoading } = useQuery({
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
        .select('id, violation_date, fine_location, fine_type, fine_amount')
        .eq('assignment_status', 'pending');

      if (finesError) throw finesError;

      // Process each fine
      for (const fine of unassignedFines || []) {
        const response = await fetch('/functions/v1/analyze-traffic-fine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ fineId: fine.id }),
        });

        const data = await response.json();
        
        if (data.error) {
          console.error(`Error analyzing fine ${fine.id}:`, data.error);
          continue;
        }

        // Find the highest confidence suggestion
        const bestMatch = data.suggestions
          .sort((a, b) => b.confidence - a.confidence)
          .find(s => s.confidence > 0.7); // Only assign if confidence is > 70%

        if (bestMatch) {
          // Assign the fine to the customer
          const { error: updateError } = await supabase
            .from('traffic_fines')
            .update({ 
              lease_id: bestMatch.agreement.id,
              assignment_status: 'assigned'
            })
            .eq('id', fine.id);

          if (updateError) {
            console.error(`Error assigning fine ${fine.id}:`, updateError);
          }
        }
      }

      toast({
        title: "Bulk Assignment Complete",
        description: "Traffic fines have been analyzed and assigned where possible.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process traffic fines",
        variant: "destructive",
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
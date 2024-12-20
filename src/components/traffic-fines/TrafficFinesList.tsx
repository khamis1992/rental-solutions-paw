import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AIAssignmentDialog } from "./AIAssignmentDialog";
import { TrafficFineTableHeader } from "./table/TrafficFineTableHeader";
import { TrafficFineTableRow } from "./table/TrafficFineTableRow";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const TrafficFinesList = () => {
  const { toast } = useToast();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: fines, isLoading } = useQuery({
    queryKey: ["traffic-fines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          lease:leases(
            customer:profiles(
              id,
              full_name
            )
          ),
          vehicle:vehicles(
            make,
            model,
            license_plate
          )
        `)
        .order('violation_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAiAssignment = async (fineId: string) => {
    setIsAnalyzing(true);
    setSelectedFine(fines?.find(f => f.id === fineId));
    setAiDialogOpen(true);

    try {
      const response = await fetch('/functions/v1/analyze-traffic-fine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ fineId }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiSuggestions(data.suggestions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze fine",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAssignCustomer = async (fineId: string, customerId: string) => {
    try {
      const { data: leases, error: leaseError } = await supabase
        .from('leases')
        .select('id')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .limit(1);

      if (leaseError) throw leaseError;
      
      if (!leases?.length) {
        toast({
          title: "No Active Lease",
          description: "Customer must have an active lease to assign fines",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('traffic_fines')
        .update({ lease_id: leases[0].id })
        .eq('id', fineId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine assigned successfully",
      });
      
      setAiDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign fine",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('traffic_fines')
        .update({ payment_status: 'completed' })
        .eq('id', fineId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine marked as paid",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update fine status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading fines...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <Table>
          <TrafficFineTableHeader />
          <TableBody>
            {fines?.map((fine) => (
              <ErrorBoundary key={fine.id}>
                <TrafficFineTableRow
                  fine={fine}
                  onAssignCustomer={handleAssignCustomer}
                  onAiAssignment={handleAiAssignment}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </ErrorBoundary>
            ))}
            {!fines?.length && (
              <tr>
                <td colSpan={11} className="text-center py-4">
                  No traffic fines recorded
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>

      <AIAssignmentDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        selectedFine={selectedFine}
        onAssignCustomer={handleAssignCustomer}
        isAnalyzing={isAnalyzing}
        aiSuggestions={aiSuggestions}
      />
    </ErrorBoundary>
  );
};
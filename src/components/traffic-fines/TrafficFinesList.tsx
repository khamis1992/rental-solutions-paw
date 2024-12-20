import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CustomerSelect } from "../agreements/form/CustomerSelect";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { AIAssignmentDialog } from "./AIAssignmentDialog";

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
        .order('fine_date', { ascending: false });

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
      // First get the active lease for this customer
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
    <>
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fines?.map((fine) => (
              <TableRow key={fine.id}>
                <TableCell>
                  {new Date(fine.fine_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {fine.vehicle ? `${fine.vehicle.make} ${fine.vehicle.model} (${fine.vehicle.license_plate})` : 'N/A'}
                </TableCell>
                <TableCell>{fine.fine_type}</TableCell>
                <TableCell>{fine.fine_location}</TableCell>
                <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={fine.payment_status === 'completed' ? 'success' : 'secondary'}
                  >
                    {fine.payment_status === 'completed' ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {fine.lease?.customer ? (
                    fine.lease.customer.full_name
                  ) : (
                    <div className="flex items-center gap-2">
                      <CustomerSelect
                        register={() => {}}
                        onCustomerSelect={(customerId) => handleAssignCustomer(fine.id, customerId)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAiAssignment(fine.id)}
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {fine.payment_status !== 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsPaid(fine.id)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!fines?.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No traffic fines recorded
                </TableCell>
              </TableRow>
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
    </>
  );
};
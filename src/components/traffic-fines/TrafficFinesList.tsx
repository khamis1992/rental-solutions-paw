import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TrafficFineTableHeader } from "./table/TrafficFineTableHeader";
import { TrafficFineTableRow } from "./table/TrafficFineTableRow";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";
import { CustomerSelect } from "../agreements/form/CustomerSelect";

export const TrafficFinesList = () => {
  const { toast } = useToast();
  const [selectedFine, setSelectedFine] = useState<any>(null);

  const { data: fines, isLoading, error } = useQuery({
    queryKey: ["traffic-fines"],
    queryFn: async () => {
      console.log('Fetching traffic fines...');
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

      if (error) {
        console.error('Error fetching traffic fines:', error);
        throw error;
      }
      
      console.log('Fetched traffic fines:', data);
      return data;
    },
  });

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
        .update({ 
          lease_id: leases[0].id,
          assignment_status: 'assigned'
        })
        .eq('id', fineId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fine assigned successfully",
      });
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

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading traffic fines: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </ErrorBoundary>
            ))}
            {!fines?.length && (
              <tr>
                <td colSpan={11} className="text-center py-8 text-muted-foreground">
                  No traffic fines recorded
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </ErrorBoundary>
  );
};